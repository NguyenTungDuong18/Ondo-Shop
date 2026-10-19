using Microsoft.EntityFrameworkCore;
using MySystem.Repository;
using MySystem.Repository.Entities;
using Npgsql;

namespace MySystem.Service.Chat.Infrastructure;

/// <summary>Helper persistence tối thiểu cho bảng ChatRecords; không giữ state giữa các lần gọi.</summary>
internal static class ChatRecords
{
    /// <summary>Luôn lọc Type trước khi diễn giải cột quan hệ hoặc payload JSON của bản ghi.</summary>
    public static IQueryable<ChatRecord> Records(this AppDbContext db, string type) =>
        db.Set<ChatRecord>().Where(x => x.Type == type);

    /// <summary>
    /// Thêm participant/membership/friendship nếu identity chưa tồn tại.
    /// Unique index DB xử lý tranh chấp giữa instance; chỉ lỗi trùng identity được coi là đã tồn tại.
    /// </summary>
    public static async Task<bool> TryAddIdentity(this AppDbContext db, ChatRecord record, CancellationToken ct)
    {
        if (await db.Records(record.Type).AnyAsync(x => x.IdentityKey == record.IdentityKey, ct)) return false;
        db.Add(record);
        try
        {
            await db.SaveChangesAsync(ct);
            return true;
        }
        catch (DbUpdateException exception) when (exception.InnerException is PostgresException
            { SqlState: PostgresErrorCodes.UniqueViolation, ConstraintName: "IX_ChatRecords_Type_IdentityKey" })
        {
            db.Entry(record).State = EntityState.Detached;
            return false;
        }
    }
}
