using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MySystem.Repository;
using MySystem.Repository.Entities;
using MySystem.Service.Chat.Infrastructure;
using MySystem.Service.Chat.Realtime;
using MySystem.Service.Chat.State;

namespace MySystem.Service.Chat.Rooms;

/// <summary>Khối phòng chat có khóa ghi và bộ đếm thử mã riêng; không gọi service tin nhắn/kết bạn.</summary>
public sealed class ChatRoomService(AppDbContext db, ChatWriteCoordinator<ChatRoomService> writes, ChatJoinLimiter limiter,
    IChatPublisher publisher, IChatStateService state, TimeProvider clock) : IChatRoomService
{
    /// <inheritdoc />
    public async Task Create(Guid userId, string name, CancellationToken ct = default)
    {
        name = name?.Trim() ?? "";
        if (name.Length is < 1 or > 80) throw new HubException("Tên phòng phải có từ 1 đến 80 ký tự.");
        Guid roomId;
        using (await writes.Acquire("room-invites", ct))
        {
            // Khóa DB chỉ bảo vệ việc cấp mã, tránh hai API instance cấp cùng mã còn hiệu lực.
            await using var transaction = db.Database.IsNpgsql() ? await db.Database.BeginTransactionAsync(ct) : null;
            if (transaction != null)
                await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(735291047)", ct);
            var now = clock.GetUtcNow().UtcDateTime;
            string code;
            do { code = RandomNumberGenerator.GetInt32(100000, 1000000).ToString(); }
            while (await db.Records(ChatRecordType.Room).AnyAsync(x => x.InviteCode == code && x.ExpiresAt > now, ct));
            var room = new ChatRecord
            {
                Type = ChatRecordType.Room, Data = JsonSerializer.Serialize(new { name }),
                InviteCode = code, ExpiresAt = now.AddMinutes(5), CreatedAt = now
            };
            roomId = room.Id;
            // Phòng và membership của người tạo được lưu cùng lần SaveChanges/transaction.
            db.Add(room);
            db.Add(Membership(userId, roomId));
            await db.SaveChangesAsync(ct);
            if (transaction != null) await transaction.CommitAsync(ct);
        }
        // Nhả khóa trước khi đọc state hoặc gửi qua mạng để client chậm không giữ khóa ghi.
        await state.Refresh(ct, userId);
        await publisher.RoomOpened(userId, roomId, ct);
    }

    /// <inheritdoc />
    public async Task Join(Guid userId, string code, CancellationToken ct = default)
    {
        // Tính cả mã sai vào hạn mức để tránh thử vét cạn mã mời sáu chữ số.
        limiter.Check(userId);
        if (code == null || code.Length != 6 || code.Any(c => c is < '0' or > '9'))
            throw new HubException("Vui lòng nhập mã gồm 6 chữ số.");
        var now = clock.GetUtcNow().UtcDateTime;
        var roomId = await db.Records(ChatRecordType.Room).Where(x => x.InviteCode == code && x.ExpiresAt > now)
            .Select(x => (Guid?)x.Id).SingleOrDefaultAsync(ct)
            ?? throw new HubException("Mã phòng không hợp lệ hoặc đã hết hạn.");
        var member = Membership(userId, roomId);
        using (await writes.Acquire(member.IdentityKey!, ct))
            await db.TryAddIdentity(member, ct);
        await state.Refresh(ct, userId);
        await publisher.RoomOpened(userId, roomId, ct);
    }

    private static ChatRecord Membership(Guid userId, Guid roomId) => new()
    {
        Type = ChatRecordType.Membership, RoomId = roomId, UserId = userId, IdentityKey = $"{roomId}:{userId}"
    };
}
