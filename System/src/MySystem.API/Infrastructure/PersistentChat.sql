CREATE TABLE IF NOT EXISTS "ChatRecords" (
    "Id" uuid NOT NULL,
    "Type" character varying(24) NOT NULL,
    "IdentityKey" character varying(80),
    "UserId" uuid,
    "PeerId" uuid,
    "RoomId" uuid,
    "Status" character varying(24),
    "InviteCode" character varying(6),
    "ExpiresAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone NOT NULL,
    "SchemaVersion" integer NOT NULL,
    "Data" jsonb NOT NULL,
    CONSTRAINT "PK_ChatRecords" PRIMARY KEY ("Id"),
    CONSTRAINT "CK_ChatRecords_Data" CHECK (jsonb_typeof("Data") = 'object' AND "SchemaVersion" > 0),
    CONSTRAINT "CK_ChatRecords_Type" CHECK ("Type" IN ('participant','room','membership','friendship','message')),
    CONSTRAINT "FK_ChatRecords_ChatRecords_RoomId" FOREIGN KEY ("RoomId") REFERENCES "ChatRecords" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_ChatRecords_Users_PeerId" FOREIGN KEY ("PeerId") REFERENCES "Users" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_ChatRecords_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS "IX_ChatRecords_PeerId" ON "ChatRecords" ("PeerId");

CREATE INDEX IF NOT EXISTS "IX_ChatRecords_RoomId" ON "ChatRecords" ("RoomId");

CREATE UNIQUE INDEX IF NOT EXISTS "IX_ChatRecords_Type_IdentityKey" ON "ChatRecords" ("Type", "IdentityKey");

CREATE INDEX IF NOT EXISTS "IX_ChatRecords_Type_InviteCode_ExpiresAt" ON "ChatRecords" ("Type", "InviteCode", "ExpiresAt");

CREATE INDEX IF NOT EXISTS "IX_ChatRecords_Type_PeerId_UserId_CreatedAt_Id" ON "ChatRecords" ("Type", "PeerId", "UserId", "CreatedAt", "Id");

CREATE INDEX IF NOT EXISTS "IX_ChatRecords_Type_RoomId_CreatedAt_Id" ON "ChatRecords" ("Type", "RoomId", "CreatedAt", "Id");

CREATE INDEX IF NOT EXISTS "IX_ChatRecords_Type_UserId_CreatedAt_Id" ON "ChatRecords" ("Type", "UserId", "CreatedAt", "Id");

CREATE INDEX IF NOT EXISTS "IX_ChatRecords_UserId" ON "ChatRecords" ("UserId");

-- Called within the migration/bootstrap transaction. Abort on any data conflict;
-- do not discard a legacy table unless all its rows were copied successfully.
DO $chat$
BEGIN
    IF to_regclass('"ChatRoom"') IS NOT NULL THEN
        LOCK TABLE "ChatRoom" IN ACCESS EXCLUSIVE MODE;
        INSERT INTO "ChatRecords" ("Id", "Type", "InviteCode", "ExpiresAt", "CreatedAt", "SchemaVersion", "Data")
        SELECT "Id", 'room', "InviteCode", "InviteExpiresAt", "InviteExpiresAt" - interval '5 minutes', 1,
               jsonb_build_object('name', "Name") FROM "ChatRoom";
    END IF;
    IF to_regclass('"ChatParticipant"') IS NOT NULL THEN
        LOCK TABLE "ChatParticipant" IN ACCESS EXCLUSIVE MODE;
        INSERT INTO "ChatRecords" ("Id", "Type", "IdentityKey", "UserId", "CreatedAt", "SchemaVersion", "Data")
        SELECT md5('participant:' || "UserId"::text)::uuid, 'participant', "UserId"::text, "UserId", now(), 1, '{}'::jsonb
        FROM "ChatParticipant";
    END IF;
    IF to_regclass('"ChatRoomMember"') IS NOT NULL THEN
        LOCK TABLE "ChatRoomMember" IN ACCESS EXCLUSIVE MODE;
        INSERT INTO "ChatRecords" ("Id", "Type", "IdentityKey", "UserId", "RoomId", "CreatedAt", "SchemaVersion", "Data")
        SELECT md5('membership:' || "RoomId"::text || ':' || "UserId"::text)::uuid, 'membership',
               "RoomId"::text || ':' || "UserId"::text, "UserId", "RoomId", now(), 1, '{}'::jsonb
        FROM "ChatRoomMember";
    END IF;
    IF to_regclass('"ChatFriendship"') IS NOT NULL THEN
        LOCK TABLE "ChatFriendship" IN ACCESS EXCLUSIVE MODE;
        INSERT INTO "ChatRecords" ("Id", "Type", "IdentityKey", "UserId", "PeerId", "Status", "CreatedAt", "SchemaVersion", "Data")
        SELECT md5('friendship:' || least("RequesterId"::text, "RecipientId"::text) || ':' || greatest("RequesterId"::text, "RecipientId"::text))::uuid,
               'friendship', least("RequesterId"::text, "RecipientId"::text) || ':' || greatest("RequesterId"::text, "RecipientId"::text),
               "RequesterId", "RecipientId", CASE WHEN "Accepted" THEN 'accepted' ELSE 'pending' END, now(), 1, '{}'::jsonb
        FROM "ChatFriendship";
    END IF;
    IF to_regclass('"ChatEntry"') IS NOT NULL THEN
        LOCK TABLE "ChatEntry" IN ACCESS EXCLUSIVE MODE;
        INSERT INTO "ChatRecords" ("Id", "Type", "UserId", "PeerId", "RoomId", "CreatedAt", "SchemaVersion", "Data")
        SELECT "Id", 'message', "SenderId", "ReceiverId", "RoomId", "SentAt", 1, jsonb_build_object('text', "Text")
        FROM "ChatEntry";
    END IF;
    DROP TABLE IF EXISTS "ChatEntry";
    DROP TABLE IF EXISTS "ChatFriendship";
    DROP TABLE IF EXISTS "ChatParticipant";
    DROP TABLE IF EXISTS "ChatRoomMember";
    DROP TABLE IF EXISTS "ChatRoom";
END $chat$;
