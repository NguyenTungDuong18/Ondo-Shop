namespace MySystem.Service.Product;

public class Request
{
    /// <summary>
    /// Request cho việc lấy danh sách sản phẩm với filter và phân trang
    /// </summary>
    public class ProductListRequest
    {
        public ProductFilters? Filters { get; set; }
        public ProductPaginator? Paginator { get; set; }
    }

    public class ProductFilters
    {
        public List<Guid>? Ids { get; set; }
        public string? Search { get; set; }
        public string? Category { get; set; }
        public Guid? CategoryId { get; set; }
        public decimal? PriceFrom { get; set; }
        public decimal? PriceTo { get; set; }
        public List<string>? Status { get; set; }
    }

    public class ProductPaginator
    {
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; }
        public bool IsDescending { get; set; } = true;
    }

    /// <summary>
    /// Request tạo sản phẩm mới
    /// </summary>
    public class CreateProductRequest
    {
        public string SKU { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
        public string Category { get; set; } = "General";
        public Guid? CategoryId { get; set; }
    }

    /// <summary>
    /// Request cập nhật sản phẩm
    /// </summary>
    public class UpdateProductRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
        public string Category { get; set; } = "General";
        public Guid? CategoryId { get; set; }
        public string Status { get; set; } = "Active";
    }

    /// <summary>
    /// Request xóa sản phẩm
    /// </summary>
    public class DeleteProductRequest
    {
        public bool HardDelete { get; set; } = false;
    }
}
