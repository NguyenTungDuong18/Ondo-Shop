using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MySystem.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Startup also supports installations originally created with EnsureCreated.
            migrationBuilder.Sql("""
                ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "AvatarPublicId" text NULL;
                ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "DateOfBirth" date NULL;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarPublicId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Users");
        }
    }
}
