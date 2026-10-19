namespace MySystem.Service.Chat.Presence;

/// <summary>
/// Kho trạng thái online dùng qua nhiều invocation, không chứa nghiệp vụ phòng/tin nhắn.
/// Thay implementation bằng kho dùng chung có TTL khi chạy nhiều API instance.
/// </summary>
public interface IChatPresence
{
    /// <summary>Thêm một tab; true chỉ khi người dùng vừa chuyển từ offline sang online.</summary>
    ValueTask<bool> ConnectAsync(Guid userId, string connectionId, CancellationToken ct = default);
    /// <summary>Gỡ một tab; true chỉ khi tab cuối đóng và người dùng chuyển sang offline.</summary>
    ValueTask<bool> DisconnectAsync(string connectionId, CancellationToken ct = default);
    /// <summary>Trả bản chụp ID online, không để caller sửa các collection nội bộ.</summary>
    ValueTask<IReadOnlySet<Guid>> OnlineUsersAsync(CancellationToken ct = default);
}
