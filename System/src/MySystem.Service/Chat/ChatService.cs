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
        if (!await db.Set<ChatParticipant>().AnyAsync(x => x.UserId == userId))
        {
            db.Add(new ChatParticipant { UserId = userId });
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
        var users = await db.Set<ChatParticipant>().AsNoTracking().Select(x => new { Id = x.UserId, x.User.Username }).ToListAsync();
        return users.Select(x => (object)new { x.Id, x.Username, IsOnline = connections.ContainsValue(x.Id) }).ToArray();
    }
    private async Task BroadcastPresence(AppDbContext db) => await hub.Clients.All.SendAsync("ParticipantsUpdated", await Participants(db));
    private static object Message(ChatEntry m) => new { m.Id, m.SenderId, Sender = m.Sender.Username, m.ReceiverId, m.RoomId, m.Text, Timestamp = m.SentAt };
    private async Task SendState(AppDbContext db, Guid userId, IClientProxy client)
    {
        var rooms = await db.Set<ChatRoomMember>().AsNoTracking().Where(x => x.UserId == userId)
            .Select(x => new { x.Room.Id, x.Room.Name, x.Room.InviteCode, x.Room.InviteExpiresAt }).ToListAsync();
        var roomIds = rooms.Select(x => x.Id).ToList();
        var messages = await db.Set<ChatEntry>().AsNoTracking().Include(x => x.Sender)
            .Where(x => (x.RoomId == null && x.ReceiverId == null) ||
                (x.ReceiverId != null && (x.SenderId == userId || x.ReceiverId == userId)) ||
                (x.RoomId != null && roomIds.Contains(x.RoomId.Value)))
            .OrderBy(x => x.SentAt).ThenBy(x => x.Id).ToListAsync();
        var friends = await db.Set<ChatFriendship>().AsNoTracking().Where(x => x.RequesterId == userId || x.RecipientId == userId)
            .Select(x => new { x.RequesterId, x.RecipientId, x.Accepted }).ToListAsync();
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
        var entry = new ChatEntry { SenderId = userId, Text = text };
        List<Guid>? recipients = null;
        if (target.StartsWith("room:") && Guid.TryParse(target[5..], out var roomId))
        {
            recipients = await db.Set<ChatRoomMember>().Where(x => x.RoomId == roomId).Select(x => x.UserId).ToListAsync();
            if (!recipients.Contains(userId)) throw new HubException("Bạn chưa tham gia phòng này.");
            entry.RoomId = roomId;
        }
        else if (target.StartsWith("user:") && Guid.TryParse(target[5..], out var receiverId))
        {
            if (!await db.Set<ChatFriendship>().AnyAsync(x => x.Accepted &&
                ((x.RequesterId == userId && x.RecipientId == receiverId) || (x.RequesterId == receiverId && x.RecipientId == userId))))
                throw new HubException("Hãy kết bạn trước khi gửi tin nhắn riêng.");
            entry.ReceiverId = receiverId;
            recipients = [userId, receiverId];
        }
        else if (target != "General") throw new HubException("Cuộc trò chuyện không hợp lệ.");
        db.Add(entry);
        await db.SaveChangesAsync();
        await db.Entry(entry).Reference(x => x.Sender).LoadAsync();
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
        while (await db.Set<ChatRoom>().AnyAsync(x => x.InviteCode == code && x.InviteExpiresAt > now));
        var room = new ChatRoom { Name = name, InviteCode = code, InviteExpiresAt = now.AddMinutes(5) };
        db.Add(room);
        db.Add(new ChatRoomMember { RoomId = room.Id, UserId = userId });
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
        var room = await db.Set<ChatRoom>().SingleOrDefaultAsync(x => x.InviteCode == code && x.InviteExpiresAt > now);
        if (room == null) throw new HubException("Mã phòng không hợp lệ hoặc đã hết hạn.");
        if (!await db.Set<ChatRoomMember>().AnyAsync(x => x.RoomId == room.Id && x.UserId == userId))
        {
            db.Add(new ChatRoomMember { RoomId = room.Id, UserId = userId });
            await db.SaveChangesAsync();
        }
        await Refresh(db, userId);
        await Clients(userId).SendAsync("RoomOpened", room.Id);
    });
    public Task RequestFriend(Guid userId, Guid targetId) => Run(async db =>
    {
        if (userId == targetId || !await db.Set<ChatParticipant>().AnyAsync(x => x.UserId == targetId)) throw new HubException("Người dùng không hợp lệ.");
        if (await db.Set<ChatFriendship>().AnyAsync(x => (x.RequesterId == userId && x.RecipientId == targetId) || (x.RequesterId == targetId && x.RecipientId == userId)))
            throw new HubException("Đã có lời mời hoặc hai bạn đã kết bạn.");
        db.Add(new ChatFriendship { RequesterId = userId, RecipientId = targetId });
        await db.SaveChangesAsync();
        await Refresh(db, userId, targetId);
    });
    public Task RespondFriend(Guid userId, Guid requesterId, bool accept) => Run(async db =>
    {
        var request = await db.Set<ChatFriendship>().SingleOrDefaultAsync(x => x.RequesterId == requesterId && x.RecipientId == userId && !x.Accepted);
        if (request == null) throw new HubException("Lời mời không còn tồn tại.");
        if (accept) request.Accepted = true;
        else db.Remove(request);
        await db.SaveChangesAsync();
        await Refresh(db, userId, requesterId);
    });
}
