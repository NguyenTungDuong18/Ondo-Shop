using MySystem.Service.Models;

namespace MySystem.Service.Product;

public interface IService
{
    /// <summary>
    /// Lấy danh sách sản phẩm với filter và phân trang
    /// </summary>
    Task<Response.ProductListResponse> GetProducts(Request.ProductListRequest request);

    /// <summary>
    /// Lấy chi tiết một sản phẩm theo ID
    /// </summary>
    Task<Response.ProductDetailResponse> GetProductById(Guid id);

    /// <summary>
    /// Tạo sản phẩm mới
    /// </summary>
    Task<Response.ProductCommandResponse> CreateProduct(Request.CreateProductRequest request);

    /// <summary>
    /// Cập nhật sản phẩm
    /// </summary>
    Task<Response.ProductCommandResponse> UpdateProduct(Guid id, Request.UpdateProductRequest request);

    /// <summary>
    /// Xóa sản phẩm (soft delete)
    /// </summary>
    Task<BaseResponse> DeleteProduct(Guid id);

    /// <summary>
    /// Lấy thống kê sản phẩm
    /// </summary>
    Task<Response.ProductStatisticsResponse> GetStatistics();
}
