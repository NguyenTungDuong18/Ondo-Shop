using MySystem.Repository.Abstractions;

namespace MySystem.Repository.Entities;

public class ProductImage : BaseEntity<Guid>
{
    public Guid ProductId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public bool IsPrimary { get; set; } = false;

    // Navigation
    public Product Product { get; set; } = null!;
}
