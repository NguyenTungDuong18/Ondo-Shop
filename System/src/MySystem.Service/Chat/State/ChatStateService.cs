using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MySystem.Repository;
using MySystem.Repository.Entities;
using MySystem.Service.Chat.Contracts;
using MySystem.Service.Chat.History;
using MySystem.Service.Chat.Infrastructure;
using MySystem.Service.Chat.Presence;
using MySystem.Service.Chat.Realtime;

namespace MySystem.Service.Chat.State;

/// <summary>
/// Dựng và đồng bộ snapshot sau khi nghiệp vụ hoàn tất. Khối này chỉ đọc DB;
/// lịch sử được lấy qua IChatHistoryService, dữ liệu gửi qua IChatPublisher.
/// </summary>
public sealed class ChatStateService(AppDbContext db, IChatPresence presence, IChatHistoryService history,
    IChatPublisher publisher, IOptions<ChatOptions> options) : IChatStateService
{
    /// <inheritdoc />
    public Task<ChatState> GetState(Guid userId, CancellationToken ct = default) => ReadState(userId, ct);

    /// <inheritdoc />
    public async Task Sync(Guid userId, string connectionId, CancellationToken ct = default) =>
        await publisher.StateToConnection(connectionId, await GetState(userId, ct), ct);

    /// <inheritdoc />
    public async Task Refresh(CancellationToken ct, params Guid[] userIds)
    {
        // Hai người cùng bị ảnh hưởng chỉ cần đọc participant một lần.
        // Đọc tuần tự vì các dependency trong cùng invocation dùng một DbContext scoped.
        var participants = await Participants(ct);
        foreach (var userId in userIds.Distinct())
            await publisher.StateToUser(userId, await ReadState(userId, ct, participants), ct);
    }

    /// <inheritdoc />
    public async Task BroadcastPresence(CancellationToken ct = default) =>
        await publisher.Presence(await Participants(ct), ct);

    private async Task<IReadOnlyList<ChatUser>> Participants(CancellationToken ct)
    {
        var users = await db.Records(ChatRecordType.Participant).AsNoTracking()
            .Select(x => new { Id = x.UserId!.Value, x.User!.Username }).ToListAsync(ct);
        var online = await presence.OnlineUsersAsync(ct);
        return users.Select(x => new ChatUser(x.Id, x.Username, online.Contains(x.Id))).ToArray();
    }

    private async Task<ChatState> ReadState(Guid userId, CancellationToken ct, IReadOnlyList<ChatUser>? participants = null)
    {
        // Chỉ dựng phòng có membership của chính người đang đồng bộ.
        var records = await db.Records(ChatRecordType.Membership).AsNoTracking().Where(x => x.UserId == userId)
            .Select(x => new { x.Room!.Id, x.Room.Data, x.Room.InviteCode, x.Room.ExpiresAt }).ToListAsync(ct);
        var rooms = records.Select(x => new ChatRoom(x.Id, ReadRoomName(x.Data), x.InviteCode, x.ExpiresAt)).ToArray();
        var friends = await db.Records(ChatRecordType.Friendship).AsNoTracking()
            .Where(x => x.UserId == userId || x.PeerId == userId)
            .Select(x => new ChatFriendship(x.UserId, x.PeerId, x.Status == "accepted")).ToListAsync(ct);
        var page = await history.GetVisibleMessages(userId, options.Value.InitialMessageLimit, ct);
        return new(participants ?? await Participants(ct), rooms, friends, page.Messages, page.HasMore);
    }

    private static string ReadRoomName(string data)
    {
        using var json = System.Text.Json.JsonDocument.Parse(data);
        return json.RootElement.TryGetProperty("name", out var value) ? value.GetString() ?? "" : "";
    }
}
