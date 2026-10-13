using Microsoft.EntityFrameworkCore;
using MySystem.Repository;

namespace MySystem.API.Infrastructure;

public static class ChatSchema
{
    // Existing installations use EnsureCreated, so EF migration history may not exist.
    // This additive bootstrap also works when the tables were created by EF migrations.
    public static async Task EnsureAsync(AppDbContext db)
    {
        await using var transaction = await db.Database.BeginTransactionAsync();
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(735291046)");
        using var stream = typeof(ChatSchema).Assembly.GetManifestResourceStream("MySystem.API.Infrastructure.PersistentChat.sql")
            ?? throw new InvalidOperationException("Missing chat schema resource.");
        using var reader = new StreamReader(stream);
        await db.Database.ExecuteSqlRawAsync(await reader.ReadToEndAsync());
        await transaction.CommitAsync();
    }
}
