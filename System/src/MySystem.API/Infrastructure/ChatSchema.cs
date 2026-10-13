using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using MySystem.Repository;

namespace MySystem.API.Infrastructure;

public static class ChatSchema
{
    // Existing installations use EnsureCreated, so EF migration history may not exist.
    // The transactional bootstrap consolidates legacy tables and also works after EF migrations.
    public static async Task EnsureAsync(AppDbContext db)
    {
        await using var transaction = await db.Database.BeginTransactionAsync();
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(735291046)");
        using var stream = typeof(ChatSchema).Assembly.GetManifestResourceStream("MySystem.API.Infrastructure.PersistentChat.sql")
            ?? throw new InvalidOperationException("Missing chat schema resource.");
        using var reader = new StreamReader(stream);
        // Execute this embedded, parameterless script verbatim. ExecuteSqlRaw formats
        // braces as placeholders, which breaks the literal '{}' JSONB values.
        await using var command = db.Database.GetDbConnection().CreateCommand();
        command.Transaction = transaction.GetDbTransaction();
        command.CommandText = await reader.ReadToEndAsync();
        command.CommandTimeout = db.Database.GetCommandTimeout() ?? 30;
        await command.ExecuteNonQueryAsync();
        await transaction.CommitAsync();
    }
}
