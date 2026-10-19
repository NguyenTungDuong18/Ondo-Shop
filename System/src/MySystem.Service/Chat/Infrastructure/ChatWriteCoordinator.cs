namespace MySystem.Service.Chat.Infrastructure;

/// <summary>
/// Mỗi TFeature có một bộ 256 khóa riêng, tránh tạo dictionary khóa tăng mãi.
/// Khóa kết nối, phòng và kết bạn được đăng ký riêng nên không chặn chéo giữa các khối.
/// Đây là phối hợp trong process; unique index/transaction DB vẫn bảo vệ khi chạy nhiều instance.
/// </summary>
public sealed class ChatWriteCoordinator<TFeature> : IDisposable
{
    private readonly SemaphoreSlim[] gates = Enumerable.Range(0, 256).Select(_ => new SemaphoreSlim(1, 1)).ToArray();

    /// <summary>Giữ khóa theo định danh quan hệ; caller phải Dispose trước khi gửi sự kiện qua mạng.</summary>
    public async Task<IDisposable> Acquire(string key, CancellationToken cancellationToken)
    {
        var gate = gates[(uint)StringComparer.Ordinal.GetHashCode(key) % gates.Length];
        await gate.WaitAsync(cancellationToken);
        return new Lease(gate);
    }

    public void Dispose()
    {
        foreach (var gate in gates) gate.Dispose();
    }

    private sealed class Lease(SemaphoreSlim gate) : IDisposable
    {
        public void Dispose() => gate.Release();
    }
}
