using MySystem.Service.Chat.Contracts;

namespace MySystem.Service.Chat.History;

/// <summary>Khối lịch sử chỉ đọc: kiểm tra quyền và phân trang tin nhắn, không phát SignalR.</summary>
public interface IChatHistoryService
{
    /// <summary>Lấy một trang trong một cuộc trò chuyện; cursor là ID tin cũ nhất của trang trước.</summary>
    Task<ChatMessagePage> GetMessages(Guid userId, string target, Guid? beforeMessageId = null, int limit = 50,
        CancellationToken ct = default);

    /// <summary>Lấy các tin được phép đọc để dựng state; null giữ đầy đủ lịch sử theo giao thức cũ.</summary>
    Task<ChatMessagePage> GetVisibleMessages(Guid userId, int? limit, CancellationToken ct = default);
}
