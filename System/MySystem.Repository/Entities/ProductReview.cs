using MySystem.Repository.Abstractions;

namespace MySystem.Repository.Entities;

public class ProductReview : BaseEntity<Guid>
{
    public Guid ProductId { get; set; }
    public Guid UserId { get; set; }

    public int Rating { get; set; } = 5; // 1-5 stars
    public string? Title { get; set; }
    public string? Comment { get; set; }

    public bool IsVerifiedPurchase { get; set; } = false;
    public bool IsApproved { get; set; } = true;

    // Navigation
    public Product Product { get; set; } = null!;
    public User User { get; set; } = null!;
}
