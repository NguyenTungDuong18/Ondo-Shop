using Microsoft.AspNetCore.SignalR;
using MySystem.Service.Chat.Contracts;

namespace MySystem.Service.Chat.Realtime;

/// <summary>
/// Adapter SignalR không có state riêng và không phụ thuộc DbContext/service nghiệp vụ.
/// Có thể đăng ký singleton hoặc thay bằng adapter khác qua IChatPublisher.
/// </summary>
public sealed class ChatPublisher(IHubContext<ChatHub> hub) : IChatPublisher
{
    /// <summary>Tên group ổn định giữa các API instance, dùng Guid dạng chuẩn để tránh khác cách viết.</summary>
    public static string UserGroup(Guid userId) => $"chat:user:{userId:D}";

    /// <inheritdoc />
    public Task AddConnection(Guid userId, string connectionId, CancellationToken ct = default) =>
        hub.Groups.AddToGroupAsync(connectionId, UserGroup(userId), ct);

    /// <inheritdoc />
    public Task RemoveConnection(Guid userId, string connectionId) =>
        hub.Groups.RemoveFromGroupAsync(connectionId, UserGroup(userId));

    /// <inheritdoc />
    public Task StateToConnection(string connectionId, ChatState state, CancellationToken ct = default) =>
        hub.Clients.Client(connectionId).SendAsync("ChatState", state, ct);

    /// <inheritdoc />
    public Task StateToUser(Guid userId, ChatState state, CancellationToken ct = default) =>
        hub.Clients.Group(UserGroup(userId)).SendAsync("ChatState", state, ct);

    /// <inheritdoc />
    public Task Presence(IReadOnlyList<ChatUser> participants, CancellationToken ct = default) =>
        hub.Clients.All.SendAsync("ParticipantsUpdated", participants, ct);

    /// <inheritdoc />
    public Task Message(ChatMessage message, IReadOnlyList<Guid>? recipients, CancellationToken ct = default)
    {
        // Gửi theo group người nhận, không quét tất cả connection trong process.
        // Khi có backplane, cùng group này có thể nhận tin ở API instance khác.
        var clients = recipients == null ? hub.Clients.All : hub.Clients.Groups(recipients.Distinct().Select(UserGroup).ToArray());
        return clients.SendAsync("MessageReceived", message, ct);
    }

    /// <inheritdoc />
    public Task RoomOpened(Guid userId, Guid roomId, CancellationToken ct = default) =>
        hub.Clients.Group(UserGroup(userId)).SendAsync("RoomOpened", roomId, ct);
}
