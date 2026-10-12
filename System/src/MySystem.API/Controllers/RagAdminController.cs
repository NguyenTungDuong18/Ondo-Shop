using Microsoft.AspNetCore.Mvc;
using MySystem.Service.Models;
using MySystem.Service.Rag;

namespace MySystem.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class RagAdminController : ControllerBase
{
    private readonly IRagService _ragService;

    public RagAdminController(IRagService ragService)
    {
        _ragService = ragService;
    }

    [HttpPost("ReindexProducts")]
    public async Task<IActionResult> ReindexProducts()
    {
        var count = await _ragService.ReindexAllProducts();
        return Ok(ApiResponseFactory.Base(new { indexed = count }, message: "Đồng bộ hóa vector sản phẩm thành công"));
    }
}
