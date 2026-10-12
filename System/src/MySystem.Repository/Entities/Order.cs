using MySystem.Repository.Abstractions;

namespace MySystem.Repository.Entities;

public enum OrderStatus
{
    Pending,
    Confirmed,
    Processing,
    Shipped,
    Delivered,
    Cancelled
}

public class Order : BaseEntity<Guid>
{
    public string OrderNumber { get; set; } = string.Empty; // Mã đơn hàng: ORD-20260817-XXXX
    public Guid UserId { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public string StatusDescription { get; set; } = "Chờ xác nhận";

    // Shipping Info
    public string ShippingName { get; set; } = string.Empty;
    public string ShippingPhone { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string? ShippingNote { get; set; }

    // Payment
    public decimal TotalAmount { get; set; } = 0;
    public decimal ShippingFee { get; set; } = 0;
    public decimal DiscountAmount { get; set; } = 0;

    // Timestamps
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? CancelledAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
