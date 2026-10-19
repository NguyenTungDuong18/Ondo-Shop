using Microsoft.AspNetCore.SignalR;

namespace MySystem.Service.Chat;

/// <summary>Giá trị đích bất biến sau khi đọc chuỗi giao thức; không chứa state hay dependency DI.</summary>
internal readonly record struct ChatTarget(Guid? RoomId, Guid? ReceiverId)
{
    /// <summary>Chỉ chấp nhận General, room:Guid hoặc user:Guid; từ chối chuỗi sai trước khi truy vấn.</summary>
    public static ChatTarget Parse(string? value)
    {
        if (value == "General") return new(null, null);
        if (value?.StartsWith("room:", StringComparison.Ordinal) == true && Guid.TryParse(value[5..], out var roomId))
            return new(roomId, null);
        if (value?.StartsWith("user:", StringComparison.Ordinal) == true && Guid.TryParse(value[5..], out var receiverId))
            return new(null, receiverId);
        throw new HubException("Cuộc trò chuyện không hợp lệ.");
    }
}
