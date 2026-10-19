namespace MySystem.Service.Chat.Friendships;

/// <summary>Khối kết bạn: quản lý lời mời và quyền trả lời của người nhận.</summary>
public interface IChatFriendshipService
{
    /// <summary>Tạo một lời mời duy nhất cho cặp người dùng, bất kể chiều gửi.</summary>
    Task Request(Guid userId, Guid targetId, CancellationToken ct = default);

    /// <summary>Chỉ người nhận được chấp nhận hoặc từ chối lời mời đang chờ.</summary>
    Task Respond(Guid userId, Guid requesterId, bool accept, CancellationToken ct = default);
}
