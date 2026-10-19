namespace MySystem.Service.Chat.Messages;

/// <summary>Khối gửi tin nhắn: kiểm tra quyền, lưu DB và phát sự kiện sau khi lưu thành công.</summary>
public interface IChatMessageService
{
    /// <summary>Gửi vào phòng chung, phòng riêng hoặc cho một người đã kết bạn.</summary>
    Task Send(Guid userId, string target, string message, CancellationToken ct = default);
}
