namespace MySystem.Service.Chat;

/// <summary>Cấu hình truy vấn lịch sử, được API bind và validate lúc khởi động.</summary>
public sealed class ChatOptions
{
    /// <summary>Null giữ lịch sử đầy đủ; chỉ đặt giới hạn sau khi UI hỗ trợ tải trang tin cũ.</summary>
    public int? InitialMessageLimit { get; set; }
    /// <summary>Số tin tối đa cho mỗi lần GetMessages; tránh client yêu cầu một trang quá lớn.</summary>
    public int MaxHistoryPageSize { get; set; } = 200;
}
