namespace MySystem.Repository.Entities;

public class ChatParticipant
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}

public class ChatRoom
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string InviteCode { get; set; } = string.Empty;
    public DateTime InviteExpiresAt { get; set; }
}

public class ChatRoomMember
{
    public Guid RoomId { get; set; }
    public ChatRoom Room { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}

public class ChatFriendship
{
    public Guid RequesterId { get; set; }
    public User Requester { get; set; } = null!;
    public Guid RecipientId { get; set; }
    public User Recipient { get; set; } = null!;
    public bool Accepted { get; set; }
}

public class ChatEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SenderId { get; set; }
    public User Sender { get; set; } = null!;
    public Guid? ReceiverId { get; set; }
    public User? Receiver { get; set; }
    public Guid? RoomId { get; set; }
    public ChatRoom? Room { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}
