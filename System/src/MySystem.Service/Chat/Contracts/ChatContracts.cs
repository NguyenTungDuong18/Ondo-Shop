namespace MySystem.Service.Chat.Contracts;

/// <summary>Thông tin participant cho danh sách người dùng; không gửi dữ liệu tài khoản nhạy cảm.</summary>
public sealed record ChatUser(Guid Id, string Username, bool IsOnline);
/// <summary>Phòng người dùng đã tham gia cùng mã mời và thời điểm mã hết hiệu lực.</summary>
public sealed record ChatRoom(Guid Id, string Name, string? InviteCode, DateTime? InviteExpiresAt);
/// <summary>Quan hệ nhìn từ hai đầu; Accepted false tương ứng lời mời đang chờ.</summary>
public sealed record ChatFriendship(Guid? RequesterId, Guid? RecipientId, bool Accepted);
/// <summary>Payload tin nhắn; ReceiverId và RoomId cùng null nghĩa là tin ở phòng chung.</summary>
public sealed record ChatMessage(Guid Id, Guid? SenderId, string Sender, Guid? ReceiverId,
    Guid? RoomId, string Text, DateTime Timestamp);
/// <summary>Snapshot riêng của người dùng; HasMoreMessages cho biết lịch sử ban đầu bị giới hạn.</summary>
public sealed record ChatState(IReadOnlyList<ChatUser> Users, IReadOnlyList<ChatRoom> Rooms,
    IReadOnlyList<ChatFriendship> Friends, IReadOnlyList<ChatMessage> Messages, bool HasMoreMessages);

/// <summary>Trang theo thời gian tăng dần; cursor tiếp theo là ID tin cũ nhất, không bao gồm lại tin đó.</summary>
public sealed record ChatMessagePage(IReadOnlyList<ChatMessage> Messages, bool HasMore, Guid? NextBeforeMessageId);
