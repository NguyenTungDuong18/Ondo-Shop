using MySystem.Repository.Abstractions;

namespace MySystem.Repository.Entities;

public class EmailVerification : BaseEntity<Guid>
{
    public Guid UserId { get; set; }
    public string OtpCode { get; set; } = string.Empty;
    public DateTime ExpiredAt { get; set; }
    public int Attempts { get; set; } = 0;
    public bool IsVerified { get; set; } = false;
    public DateTime? VerifiedAt { get; set; }
    public DateTime? ResendAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
