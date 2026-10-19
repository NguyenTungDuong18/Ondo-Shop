using MySystem.Service.Chat.Contracts;

namespace MySystem.Service.Chat.State;

/// <summary>Khối đồng bộ: dựng snapshot và thông báo thay đổi mà không thực hiện ghi nghiệp vụ.</summary>
public interface IChatStateService
{
    /// <summary>Đọc snapshot của một người dùng, chỉ chứa phòng và tin nhắn họ được phép xem.</summary>
    Task<ChatState> GetState(Guid userId, CancellationToken ct = default);

    /// <summary>Gửi snapshot cho một connection cụ thể khi kết nối hoặc yêu cầu Sync.</summary>
    Task Sync(Guid userId, string connectionId, CancellationToken ct = default);

    /// <summary>Đồng bộ tất cả tab của những người bị ảnh hưởng sau khi nghiệp vụ đã lưu DB.</summary>
    Task Refresh(CancellationToken ct, params Guid[] userIds);

    /// <summary>Đọc danh sách participant và phát trạng thái online/offline mới.</summary>
    Task BroadcastPresence(CancellationToken ct = default);
}
