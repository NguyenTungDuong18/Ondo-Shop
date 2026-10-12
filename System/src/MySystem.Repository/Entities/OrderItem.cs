using MySystem.Repository.Abstractions;

namespace MySystem.Repository.Entities;

public class OrderItem : BaseEntity<Guid>
{
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty; // Snapshot tại thời điểm đặt
    public string ProductSku { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }

    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; } = 0;      // Giá tại thời điểm đặt
    public decimal DiscountAmount { get; set; } = 0;

    // Navigation
    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
