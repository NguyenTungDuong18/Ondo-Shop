using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MySystem.API.Extensions;
using MySystem.Service.Models;
using MySystem.Service.Product;

namespace MySystem.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ProductController : ControllerBase
{
    private readonly IService _productService;

    public ProductController(IService productService)
    {
        _productService = productService;
    }

    /// <summary>
    /// Lấy danh sách sản phẩm với filter và phân trang
    /// </summary>
    [HttpGet]
    [EnableRateLimiting("api")]
    public async Task<IActionResult> GetProducts([FromQuery] Request.ProductListRequest request, CancellationToken cancellationToken)
    {
        var result = await _productService.GetProducts(request);
        var response = ApiResponseFactory.BasePagination(
            result.Items,
            result.PageIndex,
            result.PageSize,
            result.TotalCount
        );
        return Ok(new
        {
            success = response.Success,
            message = response.Message,
            data = new
            {
                items = response.Items,
                pageIndex = response.PageIndex,
                pageSize = response.PageSize,
                totalCount = response.TotalCount,
                totalPages = (int)Math.Ceiling((double)response.TotalCount / response.PageSize),
                hasPreviousPage = response.HasPreviousPage,
                hasNextPage = response.HasNextPage
            },
            traceId = response.TraceId
        });
    }

    /// <summary>
    /// Lấy chi tiết sản phẩm theo ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [EnableRateLimiting("api")]
    public async Task<IActionResult> GetProductById(Guid id, CancellationToken cancellationToken)
    {
        var product = await _productService.GetProductById(id);
        return Ok(ApiResponseFactory.Base(product, true, "Lấy chi tiết sản phẩm thành công", HttpContext.TraceIdentifier));
    }

    /// <summary>
    /// Tạo sản phẩm mới
    /// </summary>
    [HttpPost]
    [Authorize(Policy = JwtExtensions.AdminPolicy)]
    public async Task<IActionResult> CreateProduct([FromBody] Request.CreateProductRequest request, CancellationToken cancellationToken)
    {
        var result = await _productService.CreateProduct(request);
        return CreatedAtAction(nameof(GetProductById), new { id = result.Id },
            ApiResponseFactory.Base(result, true, result.Message, HttpContext.TraceIdentifier));
    }

    /// <summary>
    /// Cập nhật sản phẩm
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = JwtExtensions.AdminPolicy)]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] Request.UpdateProductRequest request, CancellationToken cancellationToken)
    {
        var result = await _productService.UpdateProduct(id, request);
        return Ok(ApiResponseFactory.Base(result, true, result.Message, HttpContext.TraceIdentifier));
    }

    /// <summary>
    /// Xóa sản phẩm (soft delete)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = JwtExtensions.AdminPolicy)]
    public async Task<IActionResult> DeleteProduct(Guid id, CancellationToken cancellationToken)
    {
        var result = await _productService.DeleteProduct(id);
        return Ok(ApiResponseFactory.Base(null, result.Success, result.Message, HttpContext.TraceIdentifier));
    }

    /// <summary>
    /// Lấy thống kê sản phẩm
    /// </summary>
    [HttpGet("statistics")]
    [EnableRateLimiting("api")]
    public async Task<IActionResult> GetStatistics(CancellationToken cancellationToken)
    {
        var result = await _productService.GetStatistics();
        return Ok(ApiResponseFactory.Base(result, true, "Lấy thống kê thành công", HttpContext.TraceIdentifier));
    }
}