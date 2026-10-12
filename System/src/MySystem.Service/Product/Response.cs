namespace MySystem.Service.Product;

public class Response
{
    /// <summary>
    /// Response chi tiết một sản phẩm
    /// </summary>
    public class ProductDetailResponse
    {
        public Guid Id { get; set; }
        public string SKU { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
        public string Category { get; set; } = string.Empty;
        public Guid? CategoryId { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? OriginalPrice { get; set; }
        public double? AverageRating { get; set; }
        public int? ReviewCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// Response danh sách sản phẩm (dùng chung)
    /// </summary>
    public class ProductListResponse
    {
        public List<ProductDetailResponse> Items { get; set; } = new();
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPreviousPage => PageIndex > 1;
        public bool HasNextPage => PageIndex < TotalPages;
    }

    /// <summary>
    /// Response cho thao tác tạo/cập nhật sản phẩm
    /// </summary>
    public class ProductCommandResponse
    {
        public Guid Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool Success { get; set; }
    }

    /// <summary>
    /// Response cho thống kê sản phẩm
    /// </summary>
    public class ProductStatisticsResponse
    {
        public int TotalProducts { get; set; }
        public int ActiveProducts { get; set; }
        public int InactiveProducts { get; set; }
        public int OutOfStockProducts { get; set; }
        public decimal MaxPrice { get; set; }
        public decimal MinPrice { get; set; }
        public decimal AveragePrice { get; set; }
    }
}
