using System.Text.Json;
namespace MySystem.Repository.Entities;

public static class ChatRecordType
{
    public const string Participant = "participant";
    public const string Room = "room";
    public const string Membership = "membership";
    public const string Friendship = "friendship";
    public const string Message = "message";
}

// One row per message/relation, never an ever-growing JSON array for a conversation.
public class ChatRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Type { get; set; } = string.Empty;
    public string? IdentityKey { get; set; }
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public Guid? PeerId { get; set; }
    public User? Peer { get; set; }
    public Guid? RoomId { get; set; }
    public ChatRecord? Room { get; set; }
    public string? Status { get; set; }
    public string? InviteCode { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int SchemaVersion { get; set; } = 1;
    public string Data { get; set; } = "{}";
    public string ReadText(string key)
    {
        using var json = JsonDocument.Parse(Data);
        return json.RootElement.TryGetProperty(key, out var value) ? value.GetString() ?? "" : "";
    }
    public static string PairKey(Guid a, Guid b) => string.CompareOrdinal(a.ToString(), b.ToString()) < 0 ? $"{a}:{b}" : $"{b}:{a}";
}
