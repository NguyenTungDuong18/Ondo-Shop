using MySystem.Repository.Abstractions;

namespace MySystem.Repository.Entities;

public class Product : BaseEntity<Guid>
{
    public string SKU { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }  // Giá gốc (nếu có khuyến mãi)
    public int StockQuantity { get; set; }
    public string? ImageUrl { get; set; }
    public string Category { get; set; } = "General";
    public string Status { get; set; } = "Active"; // Active, Inactive, OutOfStock

    // RAG Embedding fields
    public List<float>? Embedding { get; set; }
    public string? EmbeddingContent { get; set; }

    // Foreign Keys
    public Guid? CategoryId { get; set; }

    // Navigation properties
    public Category? CategoryEntity { get; set; }
    public ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();
    public ICollection<ProductReview> Reviews { get; set; } = new List<ProductReview>();
}
