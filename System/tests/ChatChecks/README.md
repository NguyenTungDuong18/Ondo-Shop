# Chat behavior checks

Run from the workspace root:

```powershell
dotnet run --project System/tests/ChatChecks
```

Uses the real chat service with an isolated EF InMemory database and a recording SignalR client. Checks offline delivery, multiple tabs, invitation authorization, room expiration, persistent state across service instances, and private/room history isolation. This does not replace an integration test against PostgreSQL and real WebSocket connections.

# Database rollout

The application uses EnsureCreated for existing installations. Startup now adds only the five chat tables and their indexes using Infrastructure/PersistentChat.sql inside a transaction. Existing users, orders and products are untouched. A new EF migration, AddPersistentChat, supports databases managed through EF migrations; its Up SQL is idempotent so it can also run after the startup bootstrap. The deployment database role needs CREATE TABLE/INDEX privileges.

Configure ConnectionStrings__PostgresSql and the existing JWT settings before starting the API. Anonymous chat handles are replaced by authenticated account IDs. Old messages that were never stored by the previous implementation cannot be recovered.

Presence and the short-code collision lock currently support one API instance, matching the previous deployment design. Multiple API instances require shared presence, distributed locking and a SignalR backplane before scaling out. Chat history, accepted friendships, invitations and memberships are stored in PostgreSQL.
