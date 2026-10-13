using System.Text.Json;
using System.Security.Cryptography;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MySystem.Repository;
using MySystem.Repository.Entities;
namespace MySystem.Service.Chat;

// Presence is per application instance; chat data is persisted in PostgreSQL.
public class ChatService(IHubContext<ChatHub> hub, IServiceScopeFactory scopes) : IChatService
{
    private readonly Dictionary<string, Guid> connections = new();
    private readonly Dictionary<Guid, Queue<DateTime>> joinAttempts = new();
    private readonly SemaphoreSlim gate = new(1, 1);
    private async Task Run(Func<AppDbContext, Task> action)
    {
        await gate.WaitAsync();
        try
        {
            using var scope = scopes.CreateScope();
            await action(scope.ServiceProvider.GetRequiredService<AppDbContext>());
        }
        finally { gate.Release(); }
    }
    public Task Connect(Guid userId, string connectionId) => Run(async db =>
    {
        if (!await db.Users.AnyAsync(x => x.Id == userId)) throw new HubException("Tài khoản không tồn tại.");
        if (!await Records(db, ChatRecordType.Participant).AnyAsync(x => x.UserId == userId))
        {
            db.Add(new ChatRecord { Type = ChatRecordType.Participant, UserId = userId, IdentityKey = userId.ToString() });
            await db.SaveChangesAsync();
        }
        connections[connectionId] = userId;
        try
        {
            await SendState(db, userId, hub.Clients.Client(connectionId));
            await BroadcastPresence(db);
        }
        catch { connections.Remove(connectionId); throw; }
    });
    public Task Disconnect(string connectionId) => Run(async db =>
    {
        if (connections.Remove(connectionId)) await BroadcastPresence(db);
    });
    public Task Sync(Guid userId, string connectionId) => Run(db => SendState(db, userId, hub.Clients.Client(connectionId)));
    private IClientProxy Clients(Guid userId) => hub.Clients.Clients(connections.Where(x => x.Value == userId).Select(x => x.Key).ToList());
    private async Task<object[]> Participants(AppDbContext db)
    {
        var users = await Records(db, ChatRecordType.Participant).AsNoTracking().Select(x => new { Id = x.UserId, x.User!.Username }).ToListAsync();
        return users.Select(x => (object)new { x.Id, x.Username, IsOnline = connections.ContainsValue(x.Id!.Value) }).ToArray();
    }
    private async Task BroadcastPresence(AppDbContext db) => await hub.Clients.All.SendAsync("ParticipantsUpdated", await Participants(db));
    private static IQueryable<ChatRecord> Records(AppDbContext db, string type) => db.Set<ChatRecord>().Where(x => x.Type == type);
    private static object Message(ChatRecord m) => new { m.Id, SenderId = m.UserId, Sender = m.User!.Username, ReceiverId = m.PeerId, m.RoomId, Text = m.ReadText("text"), Timestamp = m.CreatedAt };
    private async Task SendState(AppDbContext db, Guid userId, IClientProxy client)
    {
        var roomRecords = await Records(db, ChatRecordType.Membership).AsNoTracking().Where(x => x.UserId == userId)
            .Select(x => x.Room!).ToListAsync();
        var rooms = roomRecords.Select(x => new { x.Id, Name = x.ReadText("name"), x.InviteCode, InviteExpiresAt = x.ExpiresAt }).ToList();
        var roomIds = rooms.Select(x => x.Id).ToList();
        var messages = await Records(db, ChatRecordType.Message).AsNoTracking().Include(x => x.User)
            .Where(x => (x.RoomId == null && x.PeerId == null) ||
                (x.PeerId != null && (x.UserId == userId || x.PeerId == userId)) ||
                (x.RoomId != null && roomIds.Contains(x.RoomId.Value)))
            .OrderBy(x => x.CreatedAt).ThenBy(x => x.Id).ToListAsync();
        var friends = await Records(db, ChatRecordType.Friendship).AsNoTracking().Where(x => x.UserId == userId || x.PeerId == userId)
            .Select(x => new { RequesterId = x.UserId, RecipientId = x.PeerId, Accepted = x.Status == "accepted" }).ToListAsync();
        await client.SendAsync("ChatState", new { Users = await Participants(db), Rooms = rooms, Friends = friends, Messages = messages.Select(Message) });
    }
    private async Task Refresh(AppDbContext db, params Guid[] users)
    {
        foreach (var id in users.Distinct()) await SendState(db, id, Clients(id));
    }
    public Task Send(Guid userId, string target, string message) => Run(async db =>
    {
        var text = message.Trim();
        if (text.Length == 0 || text.Length > 4000) throw new HubException("Tin nhắn phải có từ 1 đến 4.000 ký tự.");
        var entry = new ChatRecord { Type = ChatRecordType.Message, UserId = userId, Data = JsonSerializer.Serialize(new { text }) };
        List<Guid>? recipients = null;
        if (target.StartsWith("room:") && Guid.TryParse(target[5..], out var roomId))
        {
            recipients = await Records(db, ChatRecordType.Membership).Where(x => x.RoomId == roomId).Select(x => x.UserId!.Value).ToListAsync();
            if (!recipients.Contains(userId)) throw new HubException("Bạn chưa tham gia phòng này.");
            entry.RoomId = roomId;
        }
        else if (target.StartsWith("user:") && Guid.TryParse(target[5..], out var receiverId))
        {
            if (!await Records(db, ChatRecordType.Friendship).AnyAsync(x => x.Status == "accepted" &&
                ((x.UserId == userId && x.PeerId == receiverId) || (x.UserId == receiverId && x.PeerId == userId))))
                throw new HubException("Hãy kết bạn trước khi gửi tin nhắn riêng.");
            entry.PeerId = receiverId;
            recipients = [userId, receiverId];
        }
        else if (target != "General") throw new HubException("Cuộc trò chuyện không hợp lệ.");
        db.Add(entry);
        await db.SaveChangesAsync();
        await db.Entry(entry).Reference(x => x.User).LoadAsync();
        var clients = recipients == null ? hub.Clients.All : hub.Clients.Clients(connections.Where(x => recipients.Contains(x.Value)).Select(x => x.Key).ToList());
        await clients.SendAsync("MessageReceived", Message(entry));
    });
    public Task CreateRoom(Guid userId, string name) => Run(async db =>
    {
        name = name.Trim();
        if (name.Length == 0 || name.Length > 80) throw new HubException("Tên phòng phải có từ 1 đến 80 ký tự.");
        string code;
        var now = DateTime.UtcNow;
        do { code = RandomNumberGenerator.GetInt32(100000, 1000000).ToString(); }
        while (await Records(db, ChatRecordType.Room).AnyAsync(x => x.InviteCode == code && x.ExpiresAt > now));
        var room = new ChatRecord { Type = ChatRecordType.Room, Data = JsonSerializer.Serialize(new { name }), InviteCode = code, ExpiresAt = now.AddMinutes(5) };
        db.Add(room);
        db.Add(new ChatRecord { Type = ChatRecordType.Membership, RoomId = room.Id, UserId = userId, IdentityKey = $"{room.Id}:{userId}" });
        await db.SaveChangesAsync();
        await Refresh(db, userId);
        await Clients(userId).SendAsync("RoomOpened", room.Id);
    });
    public Task JoinRoom(Guid userId, string code) => Run(async db =>
    {
        var now = DateTime.UtcNow;
        foreach (var stale in joinAttempts.Where(x => x.Value.Count == 0 || x.Value.Last() <= now.AddMinutes(-5)).Select(x => x.Key).ToList()) joinAttempts.Remove(stale);
        if (!joinAttempts.TryGetValue(userId, out var attempts)) joinAttempts[userId] = attempts = new();
        while (attempts.TryPeek(out var time) && time <= now.AddMinutes(-5)) attempts.Dequeue();
        if (attempts.Count >= 10) throw new HubException("Bạn đã thử quá nhiều mã. Vui lòng thử lại sau 5 phút.");
        attempts.Enqueue(now);
        if (code.Length != 6 || code.Any(c => c < '0' || c > '9')) throw new HubException("Vui lòng nhập mã gồm 6 chữ số.");
        var room = await Records(db, ChatRecordType.Room).SingleOrDefaultAsync(x => x.InviteCode == code && x.ExpiresAt > now);
        if (room == null) throw new HubException("Mã phòng không hợp lệ hoặc đã hết hạn.");
        if (!await Records(db, ChatRecordType.Membership).AnyAsync(x => x.RoomId == room.Id && x.UserId == userId))
        {
            db.Add(new ChatRecord { Type = ChatRecordType.Membership, RoomId = room.Id, UserId = userId, IdentityKey = $"{room.Id}:{userId}" });
            await db.SaveChangesAsync();
        }
        await Refresh(db, userId);
        await Clients(userId).SendAsync("RoomOpened", room.Id);
    });
    public Task RequestFriend(Guid userId, Guid targetId) => Run(async db =>
    {
        if (userId == targetId || !await Records(db, ChatRecordType.Participant).AnyAsync(x => x.UserId == targetId)) throw new HubException("Người dùng không hợp lệ.");
        if (await Records(db, ChatRecordType.Friendship).AnyAsync(x => (x.UserId == userId && x.PeerId == targetId) || (x.UserId == targetId && x.PeerId == userId)))
            throw new HubException("Đã có lời mời hoặc hai bạn đã kết bạn.");
        db.Add(new ChatRecord { Type = ChatRecordType.Friendship, UserId = userId, PeerId = targetId, Status = "pending", IdentityKey = ChatRecord.PairKey(userId, targetId) });
        await db.SaveChangesAsync();
        await Refresh(db, userId, targetId);
    });
    public Task RespondFriend(Guid userId, Guid requesterId, bool accept) => Run(async db =>
    {
        var request = await Records(db, ChatRecordType.Friendship).SingleOrDefaultAsync(x => x.UserId == requesterId && x.PeerId == userId && x.Status == "pending");
        if (request == null) throw new HubException("Lời mời không còn tồn tại.");
        if (accept) request.Status = "accepted";
        else db.Remove(request);
        await db.SaveChangesAsync();
        await Refresh(db, userId, requesterId);
    });
}
