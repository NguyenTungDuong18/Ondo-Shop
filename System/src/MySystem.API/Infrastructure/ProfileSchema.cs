using Microsoft.EntityFrameworkCore;
using MySystem.Repository;

namespace MySystem.API.Infrastructure;

public static class ProfileSchema
{
    // Support existing installations bootstrapped with EnsureCreated as well as migrations.
    public static Task EnsureAsync(AppDbContext db) => db.Database.ExecuteSqlRawAsync("""
        ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "DateOfBirth" date NULL;
        ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "AvatarPublicId" text NULL;
        """);
}
