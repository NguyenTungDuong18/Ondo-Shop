using MySystem.Service.Chat.Contracts;

namespace MySystem.Service.Chat.Realtime;

/// <summary>Cổng gửi realtime: chỉ truyền payload đã được chuẩn bị, không đọc/ghi DB hay kiểm tra nghiệp vụ.</summary>
public interface IChatPublisher
{
    /// <summary>Gom các tab cùng người dùng vào một group để gửi mà không quét connection.</summary>
    Task AddConnection(Guid userId, string connectionId, CancellationToken ct = default);
    /// <summary>Gỡ group khi khởi tạo kết nối thất bại.</summary>
    Task RemoveConnection(Guid userId, string connectionId);
    /// <summary>Gửi state cho riêng một tab.</summary>
    Task StateToConnection(string connectionId, ChatState state, CancellationToken ct = default);
    /// <summary>Gửi state cho tất cả tab của một người dùng.</summary>
    Task StateToUser(Guid userId, ChatState state, CancellationToken ct = default);
    /// <summary>Phát danh sách participant đã được khối đồng bộ truy vấn.</summary>
    Task Presence(IReadOnlyList<ChatUser> participants, CancellationToken ct = default);
    /// <summary>Phát tin đã lưu; recipients null tương ứng kênh chung.</summary>
    Task Message(ChatMessage message, IReadOnlyList<Guid>? recipients, CancellationToken ct = default);
    /// <summary>Yêu cầu các tab của người dùng mở phòng vừa tạo hoặc vừa tham gia.</summary>
    Task RoomOpened(Guid userId, Guid roomId, CancellationToken ct = default);
}
