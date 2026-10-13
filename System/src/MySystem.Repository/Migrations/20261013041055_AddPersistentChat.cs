using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MySystem.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddPersistentChat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
CREATE TABLE IF NOT EXISTS "ChatFriendship" (
    "RequesterId" uuid NOT NULL,
    "RecipientId" uuid NOT NULL,
    "Accepted" boolean NOT NULL,
    CONSTRAINT "PK_ChatFriendship" PRIMARY KEY ("RequesterId", "RecipientId"),
    CONSTRAINT "FK_ChatFriendship_Users_RecipientId" FOREIGN KEY ("RecipientId") REFERENCES "Users" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_ChatFriendship_Users_RequesterId" FOREIGN KEY ("RequesterId") REFERENCES "Users" ("Id") ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "ChatParticipant" (
    "UserId" uuid NOT NULL,
    CONSTRAINT "PK_ChatParticipant" PRIMARY KEY ("UserId"),
    CONSTRAINT "FK_ChatParticipant_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "ChatRoom" (
    "Id" uuid NOT NULL,
    "Name" character varying(80) NOT NULL,
    "InviteCode" character varying(6) NOT NULL,
    "InviteExpiresAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_ChatRoom" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS "ChatEntry" (
    "Id" uuid NOT NULL,
    "SenderId" uuid NOT NULL,
    "ReceiverId" uuid,
    "RoomId" uuid,
    "Text" character varying(4000) NOT NULL,
    "SentAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_ChatEntry" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_ChatEntry_ChatRoom_RoomId" FOREIGN KEY ("RoomId") REFERENCES "ChatRoom" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_ChatEntry_Users_ReceiverId" FOREIGN KEY ("ReceiverId") REFERENCES "Users" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_ChatEntry_Users_SenderId" FOREIGN KEY ("SenderId") REFERENCES "Users" ("Id") ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "ChatRoomMember" (
    "RoomId" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    CONSTRAINT "PK_ChatRoomMember" PRIMARY KEY ("RoomId", "UserId"),
    CONSTRAINT "FK_ChatRoomMember_ChatRoom_RoomId" FOREIGN KEY ("RoomId") REFERENCES "ChatRoom" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_ChatRoomMember_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS "IX_ChatEntry_ReceiverId_SenderId_SentAt" ON "ChatEntry" ("ReceiverId", "SenderId", "SentAt");

CREATE INDEX IF NOT EXISTS "IX_ChatEntry_RoomId_SentAt" ON "ChatEntry" ("RoomId", "SentAt");

CREATE INDEX IF NOT EXISTS "IX_ChatEntry_SenderId" ON "ChatEntry" ("SenderId");

CREATE INDEX IF NOT EXISTS "IX_ChatFriendship_RecipientId" ON "ChatFriendship" ("RecipientId");

CREATE INDEX IF NOT EXISTS "IX_ChatRoom_InviteCode" ON "ChatRoom" ("InviteCode");

CREATE INDEX IF NOT EXISTS "IX_ChatRoomMember_UserId" ON "ChatRoomMember" ("UserId");

""");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChatEntry");

            migrationBuilder.DropTable(
                name: "ChatFriendship");

            migrationBuilder.DropTable(
                name: "ChatParticipant");

            migrationBuilder.DropTable(
                name: "ChatRoomMember");

            migrationBuilder.DropTable(
                name: "ChatRoom");

        }
    }
}
