using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MySystem.API.Extensions;
using MySystem.Service.Order;

namespace MySystem.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly IService _orderService;

    public OrderController(IService orderService)
    {
        _orderService = orderService;
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : throw new UnauthorizedAccessException("Invalid user token");
    }

    /// <summary>
    /// Lấy danh sách đơn hàng (Admin)
    /// </summary>
    [HttpGet]
    [Authorize(Policy = JwtExtensions.AdminPolicy)]
    [EnableRateLimiting("api")]
    public async Task<IActionResult> GetOrders([FromQuery] Request.OrderListRequest request)
    {
        var result = await _orderService.GetOrders(request);
        return Ok(new
        {
            success = true,
            message = "Lấy danh sách đơn hàng thành công",
            data = result,
            traceId = HttpContext.TraceIdentifier
        });
    }

    /// <summary>
    /// Lấy chi tiết đơn hàng
    /// </summary>
    [HttpGet("{id:guid}")]
    [EnableRateLimiting("api")]
    public async Task<IActionResult> GetOrderById(Guid id)
    {
        var userId = GetUserId();
        var order = await _orderService.GetOrderById(id);

        // Non-admin: chỉ xem được đơn của chính mình
        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin && order.UserId != userId)
            return Forbid();

        return Ok(new
        {
            success = true,
            message = "Lấy chi tiết đơn hàng thành công",
            data = order,
            traceId = HttpContext.TraceIdentifier
        });
    }

    /// <summary>
    /// Lấy đơn hàng của user hiện tại
    /// </summary>
    [HttpGet("my-orders")]
    [EnableRateLimiting("api")]
    public async Task<IActionResult> GetMyOrders([FromQuery] Request.OrderListRequest request)
    {
        var userId = GetUserId();
        var result = await _orderService.GetMyOrders(userId, request);
        return Ok(new
        {
            success = true,
            message = "Lấy đơn hàng thành công",
            data = result,
            traceId = HttpContext.TraceIdentifier
        });
    }

    /// <summary>
    /// Tạo đơn hàng mới
    /// </summary>
    [HttpPost]
    [EnableRateLimiting("api")]
    public async Task<IActionResult> CreateOrder([FromBody] Request.CreateOrderRequest request)
    {
        var userId = GetUserId();
        var result = await _orderService.CreateOrder(userId, request);
        return CreatedAtAction(nameof(GetOrderById), new { id = result.Id }, new
        {
            success = true,
            message = "Đặt hàng thành công!",
            data = result,
            traceId = HttpContext.TraceIdentifier
        });
    }

    /// <summary>
    /// Cập nhật trạng thái đơn hàng (Admin)
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = JwtExtensions.AdminPolicy)]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] Request.UpdateOrderStatusRequest request)
    {
        var result = await _orderService.UpdateOrderStatus(id, request);
        return Ok(new
        {
            success = true,
            message = "Cập nhật trạng thái đơn hàng thành công",
            data = result,
            traceId = HttpContext.TraceIdentifier
        });
    }
}
