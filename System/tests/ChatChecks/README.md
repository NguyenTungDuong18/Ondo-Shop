# Chat data model

All chat persistence uses one PostgreSQL table: `ChatRecords`.

| Type | Relational columns | JSONB Data |
| --- | --- | --- |
| participant | UserId, IdentityKey = user ID | {} |
| room | Id, InviteCode, ExpiresAt | { "name": "Tên phòng" } |
| membership | UserId, RoomId, IdentityKey = room:user | {} |
| friendship | UserId (requester), PeerId (recipient), Status (pending/accepted), IdentityKey = sorted pair | {} |
| message | UserId (sender), PeerId (recipient), RoomId, CreatedAt | { "text": "Nội dung" } |

`Id` identifies a record; `Type` selects its meaning. `SchemaVersion` versions its payload format. `CreatedAt` is a UTC timestamp. A message with both PeerId and RoomId null belongs to the general channel.

Each message and each membership has its own row. Do not append the entire conversation or all room members to one JSON array: independently addressable rows support concurrent writes, indexing and later keyset pagination. Frequently queried fields stay in relational columns. Add optional payload fields (attachments, reactions, etc.) through explicit application/schema-version changes; do not add indexes on arbitrary JSON unless a query requires them.

Indexes cover Type + user/time/id, recipient/sender/time/id, room/time/id and invitation code/expiry. Type + IdentityKey is unique to prevent duplicate participants, memberships and unordered friendships. User foreign keys and room self-reference preserve record references. Query code must always filter Type before interpreting a record.

## Database rollout

Stop old API instances before deploying the new API. Configure `ConnectionStrings__PostgresSql` and the existing JWT settings. Startup runs `Infrastructure/PersistentChat.sql` within a transaction and PostgreSQL advisory lock. It creates ChatRecords, copies all five legacy chat tables, then drops the old tables. Message IDs, content, timestamps, room IDs, invitation expiry, membership and friendship direction/status are preserved. Records that lacked creation timestamps in the old model receive the migration time (rooms use invite expiry minus five minutes).

The EF migration `ConsolidateChatRecords` performs the same conversion for migration-managed databases. Both paths also support a fresh database or an already-consolidated database. Inserts deliberately fail on conflicting data; there is no ON CONFLICT DO NOTHING that could discard legacy data before the tables are dropped. The transaction rolls back if any copy fails. The database role requires CREATE, INSERT, DROP and table-lock privileges. Automatic Down is disabled: rollback needs an explicit reverse data migration or a database restore to preserve future JSON fields.

Historical migrations keep their old entity names to describe older schemas. To update the configured database explicitly, run from the workspace root:

```powershell
dotnet ef database update --project System/src/MySystem.Repository --startup-project System/src/MySystem.API --configuration Release
```

EF tooling reads the API's appsettings.json, then appsettings.{Environment}.json (Development by default), with ConnectionStrings__PostgresSql taking precedence. Set DOTNET_ENVIRONMENT or ASPNETCORE_ENVIRONMENT to target a different environment, or append `-- --environment Production`. Missing connection settings cause an explicit error instead of falling back to a different local database. The design-time factory does not launch the API or run seed data.

## Scaling limits

One table does not automatically make the entire chat service horizontally scalable. Current presence and invitation-code collision locking are in one API process. Multiple instances still need shared presence, distributed coordination and a SignalR backplane. The current history endpoint returns all authorized messages; add keyset pagination before histories become large. The indexed CreatedAt/Id columns support that change without putting entire conversations into JSON blobs.

## Checks

Run from the workspace root:

```powershell
dotnet run --project System/tests/ChatChecks -c Release
```

The checks use the real chat service with an isolated EF InMemory database and a recording SignalR client. They cover offline delivery, multiple tabs, friend authorization, room expiration, restoration across service instances, private history isolation, one-table mapping, record types and JSON round trips. They do not replace PostgreSQL migration or WebSocket integration tests.
