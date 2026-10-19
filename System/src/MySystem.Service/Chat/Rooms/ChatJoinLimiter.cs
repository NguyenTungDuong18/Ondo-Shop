using Microsoft.AspNetCore.SignalR;

namespace MySystem.Service.Chat.Rooms;

/// <summary>Bộ đếm chỉ dành cho tham gia phòng, dùng cửa sổ trượt 10 lần / người dùng / 5 phút.</summary>
public sealed class ChatJoinLimiter(TimeProvider clock)
{
    private readonly object gate = new();
    private readonly Dictionary<Guid, Queue<DateTimeOffset>> attempts = new();
    private DateTimeOffset nextCleanup;

    /// <summary>Từ chối khi hết hạn mức; mã đúng hoặc sai đều được tính là một lần thử.</summary>
    public void Check(Guid userId)
    {
        lock (gate)
        {
            var now = clock.GetUtcNow();
            var cutoff = now.AddMinutes(-5);
            // Dọn theo chu kỳ một phút, tránh quét mọi người dùng trên từng lần nhập mã.
            if (now >= nextCleanup)
            {
                foreach (var id in attempts.Where(x => x.Value.Last() <= cutoff).Select(x => x.Key).ToArray())
                    attempts.Remove(id);
                nextCleanup = now.AddMinutes(1);
            }
            if (!attempts.TryGetValue(userId, out var queue)) attempts[userId] = queue = new();
            while (queue.TryPeek(out var time) && time <= cutoff) queue.Dequeue();
            if (queue.Count >= 10) throw new HubException("Bạn đã thử quá nhiều mã. Vui lòng thử lại sau 5 phút.");
            queue.Enqueue(now);
        }
    }
}
