namespace MySystem.Service.Chat.Connections;

/// <summary>Khối kết nối: đăng ký participant, theo dõi online và quản lý SignalR group.</summary>
public interface IChatConnectionService
{
    /// <summary>Khởi tạo kết nối đã xác thực và gửi trạng thái ban đầu cho tab đó.</summary>
    Task Connect(Guid userId, string connectionId, CancellationToken ct = default);

    /// <summary>Gỡ kết nối; chỉ báo offline khi người dùng đã đóng tab cuối cùng.</summary>
    Task Disconnect(string connectionId, CancellationToken ct = default);
}
