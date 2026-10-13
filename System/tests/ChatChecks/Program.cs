using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MySystem.Repository;
using MySystem.Repository.Entities;
using MySystem.Service.Chat;

ConfigurationChecks.Run();

var services = new ServiceCollection();
services.AddDbContext<AppDbContext>(o => o.UseInMemoryDatabase("chat-checks"));
using var provider = services.BuildServiceProvider();
var scopes = provider.GetRequiredService<IServiceScopeFactory>();
var hub = new TestHub();
var chat = new ChatService(hub, scopes);
var alice = Guid.NewGuid(); var bob = Guid.NewGuid(); var eve = Guid.NewGuid();
async Task Database(Func<AppDbContext, Task> action)
{
    using var scope = scopes.CreateScope();
    await action(scope.ServiceProvider.GetRequiredService<AppDbContext>());
}
void Check(bool condition, string message) { if (!condition) throw new Exception(message); Console.WriteLine("PASS " + message); }
async Task Reject(Func<Task> action, string message)
{
    try { await action(); } catch (HubException) { Console.WriteLine("PASS " + message); return; }
    throw new Exception("Expected rejection: " + message);
}
JsonElement State(string id) => hub.Bus.Events.Last(x => x.Method == "ChatState" && x.Targets.Contains(id)).Payload;
await Database(async db => {
    db.Users.AddRange(new User { Id = alice, Username = "alice" }, new User { Id = bob, Username = "bob" }, new User { Id = eve, Username = "eve" });
    await db.SaveChangesAsync();
});
await chat.Connect(alice, "a1"); await chat.Connect(alice, "a2"); await chat.Connect(bob, "b1"); await chat.Connect(eve, "e1");
await chat.Disconnect("a1");
await chat.Sync(bob, "b1");
Check(State("b1").GetProperty("users").EnumerateArray().Single(x => x.GetProperty("id").GetGuid() == alice).GetProperty("isOnline").GetBoolean(), "closing one tab preserves online presence");
await Reject(() => chat.Send(alice, "user:" + bob, "not friends"), "private chat requires accepted friendship");
await chat.RequestFriend(alice, bob);
await Reject(() => chat.RespondFriend(eve, alice, true), "only invitation recipient can accept");
await chat.RespondFriend(bob, alice, true);
await chat.Disconnect("b1");
await chat.Send(alice, "user:" + bob, "offline delivery");
await chat.Sync(eve, "e1");
Check(State("e1").GetProperty("messages").GetArrayLength() == 0, "private messages excluded from other users' history");
await chat.Connect(bob, "b2");
Check(State("b2").GetProperty("messages").EnumerateArray().Any(x => x.GetProperty("text").GetString() == "offline delivery"), "offline recipient receives saved message on reconnect");
await chat.Disconnect("a2");
await chat.Sync(bob, "b2");
Check(!State("b2").GetProperty("users").EnumerateArray().Single(x => x.GetProperty("id").GetGuid() == alice).GetProperty("isOnline").GetBoolean(), "offline participant remains listed");
await chat.Connect(alice, "a3");
await chat.CreateRoom(alice, "Room one");
var room = State("a3").GetProperty("rooms")[0];
var roomId = room.GetProperty("id").GetGuid();
var code = room.GetProperty("inviteCode").GetString()!;
Check(code.Length == 6 && code.All(char.IsDigit), "room has six-digit code");
Check((room.GetProperty("inviteExpiresAt").GetDateTime() - DateTime.UtcNow).TotalSeconds is > 295 and <= 300, "invite lasts five minutes");
await Reject(() => chat.Send(eve, "room:" + roomId, "intrusion"), "nonmember cannot send into room");
await chat.JoinRoom(bob, code); await chat.JoinRoom(bob, code);
await chat.Send(alice, "room:" + roomId, "room secret");
await chat.Sync(eve, "e1");
Check(State("e1").GetProperty("rooms").GetArrayLength() == 0 && State("e1").GetProperty("messages").GetArrayLength() == 0, "nonmember cannot read room or private history");
await Database(async db => { var entity = await db.Set<ChatRecord>().FindAsync(roomId); entity!.ExpiresAt = DateTime.UtcNow.AddSeconds(-1); await db.SaveChangesAsync(); });
await Reject(() => chat.JoinRoom(eve, code), "expired invite rejected by server");
await chat.Send(bob, "room:" + roomId, "room survives expiration");
var restarted = new ChatService(hub, scopes);
await restarted.Connect(bob, "b3");
Check(State("b3").GetProperty("messages").GetArrayLength() == 3 && State("b3").GetProperty("rooms").GetArrayLength() == 1 && State("b3").GetProperty("friends")[0].GetProperty("accepted").GetBoolean(), "new service instance restores history, room membership and friendship");
await Reject(() => restarted.Send(bob, "General", new string('x', 4001)), "oversized messages rejected");
await restarted.Send(bob, "General", "public message");
await restarted.Connect(eve, "e2");
Check(State("e2").GetProperty("messages").GetArrayLength() == 1, "general history available without private history leaks");
Console.WriteLine("All chat behavior checks passed.");

await Database(async db =>
{
    var chatTables = db.Model.GetEntityTypes().Where(x => x.ClrType.Namespace == typeof(ChatRecord).Namespace && x.ClrType.Name.StartsWith("Chat"))
        .Select(x => x.GetTableName()).Distinct().ToList();
    Check(chatTables.SequenceEqual(new[] { "ChatRecords" }), "all chat entities map to exactly one table");
    var records = await db.Set<ChatRecord>().ToListAsync();
    Check(records.Select(x => x.Type).Distinct().Count() == 5, "five record types coexist in the shared table");
    Check(records.All(x => JsonDocument.Parse(x.Data).RootElement.ValueKind == JsonValueKind.Object && x.SchemaVersion == 1), "versioned JSON payloads remain objects");
    Check(records.Where(x => x.Type == ChatRecordType.Message).All(x => x.ReadText("text").Length > 0), "each message is an independent JSON record");
    var entityType = db.Model.FindEntityType(typeof(ChatRecord))!;
    Check(entityType.GetIndexes().Any(x => x.IsUnique && x.Properties.Select(p => p.Name).SequenceEqual(new[] { "Type", "IdentityKey" })),
        "unique record identity is enforced by a database index");
    Check(ChatRecord.PairKey(alice, bob) == ChatRecord.PairKey(bob, alice), "friendship identity is independent of request direction");
});

await restarted.Send(bob, "General", "Tiếng Việt \"JSON\" \\ thử\nDòng 2");
await restarted.Sync(eve, "e2");
Check(State("e2").GetProperty("messages").EnumerateArray().Any(x => x.GetProperty("text").GetString() == "Tiếng Việt \"JSON\" \\ thử\nDòng 2"),
    "JSON preserves Unicode, quotes, backslashes and newlines");

sealed record Delivery(string[] Targets, string Method, JsonElement Payload);
sealed class Bus : IHubClients
{
    public List<Delivery> Events { get; } = [];
    public IClientProxy All => new Proxy(this, ["*"]);
    public IClientProxy AllExcept(IReadOnlyList<string> excludedConnectionIds) => All;
    public IClientProxy Client(string connectionId) => new Proxy(this, [connectionId]);
    public IClientProxy Clients(IReadOnlyList<string> connectionIds) => new Proxy(this, connectionIds.ToArray());
    public IClientProxy Group(string groupName) => throw new NotSupportedException();
    public IClientProxy GroupExcept(string groupName, IReadOnlyList<string> excludedConnectionIds) => throw new NotSupportedException();
    public IClientProxy Groups(IReadOnlyList<string> groupNames) => throw new NotSupportedException();
    public IClientProxy User(string userId) => throw new NotSupportedException();
    public IClientProxy Users(IReadOnlyList<string> userIds) => throw new NotSupportedException();
}
sealed class Proxy(Bus bus, string[] targets) : IClientProxy
{
    public Task SendCoreAsync(string method, object?[] args, CancellationToken cancellationToken = default)
    {
        bus.Events.Add(new(targets, method, JsonSerializer.SerializeToElement(args[0], new JsonSerializerOptions(JsonSerializerDefaults.Web))));
        return Task.CompletedTask;
    }
}
sealed class TestHub : IHubContext<ChatHub>
{
    public Bus Bus { get; } = new();
    public IHubClients Clients => Bus;
    public IGroupManager Groups => throw new NotSupportedException();
}
