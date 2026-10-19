using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MySystem.Repository;
using MySystem.Repository.Entities;
using MySystem.Service.Chat.Infrastructure;
using MySystem.Service.Chat.Presence;
using MySystem.Service.Chat.Realtime;
using MySystem.Service.Chat.State;

namespace MySystem.Service.Chat.Connections;

/// <summary>
/// Chỉ quản lý vòng đời kết nối. Mỗi lần gọi Hub có scope riêng;
/// presence giữ số tab online, còn bộ khóa ghi chỉ thuộc khối kết nối.
/// </summary>
public sealed class ChatConnectionService(AppDbContext db, IChatPresence presence,
    ChatWriteCoordinator<ChatConnectionService> writes, IChatPublisher publisher, IChatStateService state) : IChatConnectionService
{
    /// <inheritdoc />
    public async Task Connect(Guid userId, string connectionId, CancellationToken ct = default)
    {
        if (!await db.Users.AnyAsync(x => x.Id == userId, ct)) throw new HubException("Tài khoản không tồn tại.");
        // Nhiều tab mở cùng lúc vẫn chỉ tạo một participant nhờ khóa và unique index.
        using (await writes.Acquire($"participant:{userId}", ct))
            await db.TryAddIdentity(new ChatRecord
            {
                Type = ChatRecordType.Participant, UserId = userId, IdentityKey = userId.ToString()
            }, ct);
        var changed = await presence.ConnectAsync(userId, connectionId, ct);
        try
        {
            await publisher.AddConnection(userId, connectionId, ct);
            await state.Sync(userId, connectionId, ct);
            if (changed) await state.BroadcastPresence(ct);
        }
        catch
        {
            // Không để lại trạng thái online giả nếu thêm group hoặc đồng bộ ban đầu thất bại.
            await presence.DisconnectAsync(connectionId);
            await publisher.RemoveConnection(userId, connectionId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task Disconnect(string connectionId, CancellationToken ct = default)
    {
        if (await presence.DisconnectAsync(connectionId, ct)) await state.BroadcastPresence(ct);
    }
}
