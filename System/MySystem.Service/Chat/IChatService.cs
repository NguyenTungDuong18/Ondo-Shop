using System.Collections.Generic;
using System.Threading.Tasks;

namespace MySystem.Service.Chat;

/// <summary>
/// Interface định nghĩa các nghiệp vụ xử lý Chat Realtime (SignalR).
/// Đặt ở Layer Service để các Service khác (như Auth, Product) có thể dễ dàng inject và sử dụng.
/// </summary>
public interface IChatService
{
    /// <summary>
    /// Đăng ký kết nối của người dùng vào hệ thống.
    /// </summary>
    Task RegisterConnection(string username, string connectionId);

    /// <summary>
    /// Gỡ bỏ kết nối của người dùng khỏi hệ thống.
    /// </summary>
    Task RemoveConnection(string connectionId);

    /// <summary>
    /// Gửi tin nhắn tới toàn bộ người dùng đang online (General Chat).
    /// </summary>
    Task SendGeneralMessage(string sender, string message);

    /// <summary>
    /// Gửi tin nhắn riêng tư tới một người nhận cụ thể (Private Chat).
    /// </summary>
    Task SendPrivateMessage(string sender, string targetUser, string message);

    /// <summary>
    /// Lấy danh sách tên người dùng đang online.
    /// </summary>
    IEnumerable<string> GetOnlineUsers();

    /// <summary>
    /// Tìm kiếm tên người dùng (username) dựa trên ConnectionId.
    /// </summary>
    string? GetUsernameByConnectionId(string connectionId);
}
