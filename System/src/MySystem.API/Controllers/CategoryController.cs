using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MySystem.API.Extensions;
using MySystem.Service.Category;

namespace MySystem.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly IService _categoryService;

    public CategoryController(IService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    [EnableRateLimiting("api")]
    public async Task<IActionResult> GetCategories([FromQuery] bool activeOnly = false)
    {
        var result = await _categoryService.GetCategories(activeOnly);
        return Ok(new
        {
            success = true,
            message = "Lấy danh sách danh mục thành công",
            data = result,
            traceId = HttpContext.TraceIdentifier
        });
    }

    [HttpGet("{id:guid}")]
    [EnableRateLimiting("api")]
    public async Task<IActionResult> GetCategoryById(Guid id)
    {
        var result = await _categoryService.GetCategoryById(id);
        return Ok(new
        {
            success = true,
            message = "Lấy chi tiết danh mục thành công",
            data = result,
            traceId = HttpContext.TraceIdentifier
        });
    }

    [HttpPost]
    [Authorize(Policy = JwtExtensions.AdminPolicy)]
    public async Task<IActionResult> CreateCategory([FromBody] Request.CreateCategoryRequest request)
    {
        var result = await _categoryService.CreateCategory(request);
        return CreatedAtAction(nameof(GetCategoryById), new { id = result.Id }, new
        {
            success = true,
            message = "Tạo danh mục thành công",
            data = result,
            traceId = HttpContext.TraceIdentifier
        });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = JwtExtensions.AdminPolicy)]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] Request.UpdateCategoryRequest request)
    {
        var result = await _categoryService.UpdateCategory(id, request);
        return Ok(new
        {
            success = true,
            message = "Cập nhật danh mục thành công",
            data = result,
            traceId = HttpContext.TraceIdentifier
        });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = JwtExtensions.AdminPolicy)]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        await _categoryService.DeleteCategory(id);
        return Ok(new
        {
            success = true,
            message = "Xóa danh mục thành công",
            traceId = HttpContext.TraceIdentifier
        });
    }
}
