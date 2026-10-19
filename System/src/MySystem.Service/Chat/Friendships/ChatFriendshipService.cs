using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MySystem.Repository;
using MySystem.Repository.Entities;
using MySystem.Service.Chat.Infrastructure;
using MySystem.Service.Chat.State;

namespace MySystem.Service.Chat.Friendships;

/// <summary>Khối kết bạn có bộ khóa riêng theo cặp người dùng; chỉ đồng bộ sau khi lưu thành công.</summary>
public sealed class ChatFriendshipService(AppDbContext db, ChatWriteCoordinator<ChatFriendshipService> writes,
    IChatStateService state) : IChatFriendshipService
{
    /// <inheritdoc />
    public async Task Request(Guid userId, Guid targetId, CancellationToken ct = default)
    {
        if (userId == targetId || !await db.Records(ChatRecordType.Participant).AnyAsync(x => x.UserId == targetId, ct))
            throw new HubException("Người dùng không hợp lệ.");
        // A gửi B hay B gửi A đều có cùng identity để không tạo hai quan hệ song song.
        var identity = ChatRecord.PairKey(userId, targetId);
        using (await writes.Acquire(identity, ct))
        {
            if (!await db.TryAddIdentity(new ChatRecord
                {
                    Type = ChatRecordType.Friendship, UserId = userId, PeerId = targetId,
                    Status = "pending", IdentityKey = identity
                }, ct))
                throw new HubException("Đã có lời mời hoặc hai bạn đã kết bạn.");
        }
        await state.Refresh(ct, userId, targetId);
    }

    /// <inheritdoc />
    public async Task Respond(Guid userId, Guid requesterId, bool accept, CancellationToken ct = default)
    {
        using (await writes.Acquire(ChatRecord.PairKey(userId, requesterId), ct))
        {
            var pending = db.Records(ChatRecordType.Friendship)
                .Where(x => x.UserId == requesterId && x.PeerId == userId && x.Status == "pending");
            if (db.Database.IsRelational())
            {
                // Giữ điều kiện pending ngay trong SQL để hai instance không cùng xử lý một lời mời.
                var affected = accept
                    ? await pending.ExecuteUpdateAsync(s => s.SetProperty(x => x.Status, "accepted"), ct)
                    : await pending.ExecuteDeleteAsync(ct);
                if (affected == 0) throw new HubException("Lời mời không còn tồn tại.");
            }
            else
            {
                // EF InMemory không hỗ trợ ExecuteUpdate/Delete; dùng nhánh này cho bộ kiểm tra.
                var request = await pending.SingleOrDefaultAsync(ct)
                    ?? throw new HubException("Lời mời không còn tồn tại.");
                if (accept) request.Status = "accepted";
                else db.Remove(request);
                await db.SaveChangesAsync(ct);
            }
        }
        await state.Refresh(ct, userId, requesterId);
    }
}
