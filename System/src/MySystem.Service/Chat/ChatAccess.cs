using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MySystem.Repository;
using MySystem.Repository.Entities;
using MySystem.Service.Chat.Infrastructure;

namespace MySystem.Service.Chat;

/// <summary>
/// Policy quyền truy cập dùng bởi khối gửi tin và khối lịch sử.
/// Chỉ đọc DB, không giữ cache quyền hoặc gọi service phòng/kết bạn, tránh lệch quy tắc giữa đọc và ghi.
/// </summary>
public sealed class ChatAccess(AppDbContext db)
{
    /// <summary>Kênh chung không cần membership; phòng cần tham gia, chat riêng cần quan hệ accepted.</summary>
    internal async Task Require(ChatTarget target, Guid userId, CancellationToken ct)
    {
        if (target.RoomId is Guid roomId && !await db.Records(ChatRecordType.Membership)
                .AnyAsync(x => x.RoomId == roomId && x.UserId == userId, ct))
            throw new HubException("Bạn chưa tham gia phòng này.");

        if (target.ReceiverId is Guid receiverId && !await db.Records(ChatRecordType.Friendship)
                .AnyAsync(x => x.IdentityKey == ChatRecord.PairKey(userId, receiverId) && x.Status == "accepted", ct))
            throw new HubException("Hãy kết bạn trước khi gửi tin nhắn riêng.");
    }
}
