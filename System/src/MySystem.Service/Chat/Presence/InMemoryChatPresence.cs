namespace MySystem.Service.Chat.Presence;

/// <summary>Theo dõi connection và số tab của từng người trong một process; không thực hiện I/O.</summary>
public sealed class InMemoryChatPresence : IChatPresence
{
    private readonly object gate = new();
    private readonly Dictionary<string, Guid> connections = new(StringComparer.Ordinal);
    private readonly Dictionary<Guid, int> counts = new();

    // Khóa chỉ bảo vệ thao tác bộ nhớ rất ngắn, không giữ qua truy vấn DB hoặc gửi mạng.
    /// <inheritdoc />
    public ValueTask<bool> ConnectAsync(Guid userId, string connectionId, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        lock (gate)
        {
            if (connections.ContainsKey(connectionId)) return ValueTask.FromResult(false);
            connections.Add(connectionId, userId);
            counts.TryGetValue(userId, out var count);
            counts[userId] = count + 1;
            return ValueTask.FromResult(count == 0);
        }
    }

    /// <inheritdoc />
    public ValueTask<bool> DisconnectAsync(string connectionId, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        lock (gate)
        {
            if (!connections.Remove(connectionId, out var userId)) return ValueTask.FromResult(false);
            if (counts[userId] > 1) { counts[userId]--; return ValueTask.FromResult(false); }
            counts.Remove(userId);
            return ValueTask.FromResult(true);
        }
    }

    /// <inheritdoc />
    public ValueTask<IReadOnlySet<Guid>> OnlineUsersAsync(CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        lock (gate) return ValueTask.FromResult<IReadOnlySet<Guid>>(counts.Keys.ToHashSet());
    }
}
