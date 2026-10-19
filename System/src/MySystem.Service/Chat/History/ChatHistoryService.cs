using System.Linq.Expressions;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MySystem.Repository;
using MySystem.Repository.Entities;
using MySystem.Service.Chat.Contracts;
using MySystem.Service.Chat.Infrastructure;

namespace MySystem.Service.Chat.History;

/// <summary>
/// Chỉ đọc lịch sử bằng projection không tracking. Không gửi sự kiện, không sửa phòng hay quan hệ.
/// Cả trang theo cuộc trò chuyện và lịch sử dùng cho state đều áp dụng quyền ở phía server.
/// </summary>
public sealed class ChatHistoryService(AppDbContext db, ChatAccess access, IOptions<ChatOptions> options) : IChatHistoryService
{
    /// <inheritdoc />
    public async Task<ChatMessagePage> GetMessages(Guid userId, string target, Guid? beforeMessageId = null, int limit = 50,
        CancellationToken ct = default)
    {
        if (limit < 1 || limit > options.Value.MaxHistoryPageSize)
            throw new HubException($"Số tin nhắn mỗi trang phải từ 1 đến {options.Value.MaxHistoryPageSize}.");
        var destination = ChatTarget.Parse(target);
        await access.Require(destination, userId, ct);
        var query = db.Records(ChatRecordType.Message).AsNoTracking();
        if (destination.RoomId is Guid roomId) query = query.Where(x => x.RoomId == roomId);
        else if (destination.ReceiverId is Guid peerId)
            query = query.Where(x => x.RoomId == null &&
                ((x.UserId == userId && x.PeerId == peerId) || (x.UserId == peerId && x.PeerId == userId)));
        else query = query.Where(x => x.RoomId == null && x.PeerId == null);

        if (beforeMessageId is Guid cursorId)
        {
            // Chỉ tìm cursor trong cuộc trò chuyện đã kiểm tra quyền, tránh lộ tin của phòng khác.
            var cursor = await query.Where(x => x.Id == cursorId).Select(x => new { x.CreatedAt, x.Id }).SingleOrDefaultAsync(ct)
                ?? throw new HubException("Mốc lịch sử không hợp lệ.");
            query = query.Where(x => x.CreatedAt < cursor.CreatedAt ||
                (x.CreatedAt == cursor.CreatedAt && x.Id.CompareTo(cursor.Id) < 0));
        }
        return await ReadPage(query, limit, ct);
    }

    /// <inheritdoc />
    public Task<ChatMessagePage> GetVisibleMessages(Guid userId, int? limit, CancellationToken ct = default)
    {
        // Đây cũng là biên đọc công khai: không để caller vô tình bỏ giới hạn bằng 0 hoặc số âm.
        if (limit is < 1 or > 1000) throw new ArgumentOutOfRangeException(nameof(limit));
        return ReadPage(VisibleMessages(userId), limit, ct);
    }

    // EXISTS kiểm tra membership ngay tại DB, không tải toàn bộ room ID lên bộ nhớ ứng dụng.
    private IQueryable<ChatRecord> VisibleMessages(Guid userId) => db.Records(ChatRecordType.Message).AsNoTracking()
        .Where(x => (x.RoomId == null && x.PeerId == null) ||
            (x.RoomId == null && x.PeerId != null && (x.UserId == userId || x.PeerId == userId)) ||
            (x.RoomId != null && db.Records(ChatRecordType.Membership).Any(m => m.UserId == userId && m.RoomId == x.RoomId)));

    private static async Task<ChatMessagePage> ReadPage(IQueryable<ChatRecord> query, int? limit, CancellationToken ct)
    {
        // Lấy dư một tin để biết còn trang trước; Id phân xử khi nhiều tin trùng CreatedAt.
        var ordered = query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id).Select(ProjectMessage);
        var rows = await (limit.HasValue ? ordered.Take(limit.Value + 1) : ordered).ToListAsync(ct);
        var hasMore = limit.HasValue && rows.Count > limit.Value;
        if (hasMore) rows.RemoveAt(rows.Count - 1);
        rows.Reverse(); // DB lấy tin mới nhất trước, nhưng UI nhận thứ tự thời gian tăng dần.
        var messages = rows.Select(x => new ChatMessage(x.Id, x.SenderId, x.Sender, x.ReceiverId,
            x.RoomId, ReadText(x.Data, "text"), x.Timestamp)).ToArray();
        return new(messages, hasMore, hasMore ? messages[0].Id : null);
    }

    // Chỉ lấy tên người gửi, không Include toàn bộ entity User hoặc các cột tài khoản.
    private static readonly Expression<Func<ChatRecord, MessageRow>> ProjectMessage = x =>
        new MessageRow(x.Id, x.UserId, x.User!.Username, x.PeerId, x.RoomId, x.Data, x.CreatedAt);

    private sealed record MessageRow(Guid Id, Guid? SenderId, string Sender, Guid? ReceiverId,
        Guid? RoomId, string Data, DateTime Timestamp);

    private static string ReadText(string data, string key)
    {
        using var json = JsonDocument.Parse(data);
        return json.RootElement.TryGetProperty(key, out var value) ? value.GetString() ?? "" : "";
    }
}
