using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MySystem.Repository;
using MySystem.Repository.Entities;
using MySystem.Service.Chat.Contracts;
using MySystem.Service.Chat.Infrastructure;
using MySystem.Service.Chat.Realtime;

namespace MySystem.Service.Chat.Messages;

/// <summary>Khối ghi tin nhắn; không phụ thuộc service phòng, kết bạn hoặc đồng bộ state.</summary>
public sealed class ChatMessageService(AppDbContext db, ChatAccess access, IChatPublisher publisher) : IChatMessageService
{
    /// <inheritdoc />
    public async Task Send(Guid userId, string target, string message, CancellationToken ct = default)
    {
        // Chuẩn hóa nội dung và kiểm tra quyền trước khi ghi bất kỳ tin nhắn nào.
        var text = message?.Trim() ?? "";
        if (text.Length is < 1 or > 4000) throw new HubException("Tin nhắn phải có từ 1 đến 4.000 ký tự.");
        var destination = ChatTarget.Parse(target);
        await access.Require(destination, userId, ct);
        var sender = await db.Users.Where(x => x.Id == userId).Select(x => x.Username).SingleOrDefaultAsync(ct)
            ?? throw new HubException("Tài khoản không tồn tại.");
        List<Guid>? recipients = null;
        // Danh sách nhận do server lấy từ membership; client không tự chỉ định thành viên phòng.
        if (destination.RoomId is Guid roomId)
            recipients = await db.Records(ChatRecordType.Membership).Where(x => x.RoomId == roomId)
                .Select(x => x.UserId!.Value).ToListAsync(ct);
        else if (destination.ReceiverId is Guid receiverId) recipients = [userId, receiverId];

        var entry = new ChatRecord
        {
            Type = ChatRecordType.Message, UserId = userId, PeerId = destination.ReceiverId,
            RoomId = destination.RoomId, Data = JsonSerializer.Serialize(new { text })
        };
        db.Add(entry);
        // Lưu trước rồi mới phát: tin vẫn đọc lại được nếu kết nối realtime gặp lỗi.
        await db.SaveChangesAsync(ct);
        await publisher.Message(new ChatMessage(entry.Id, userId, sender, entry.PeerId, entry.RoomId, text, entry.CreatedAt), recipients, ct);
    }
}
