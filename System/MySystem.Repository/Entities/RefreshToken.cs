using MySystem.Repository.Abstractions;

namespace MySystem.Repository.Entities;

public class RefreshToken : BaseEntity<Guid>
{
    public string RefreshTokenHash { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public string DeviceLabel { get; set; } = string.Empty;
    public DateTime ExpiredAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public User User { get; set; } = null!;
}
