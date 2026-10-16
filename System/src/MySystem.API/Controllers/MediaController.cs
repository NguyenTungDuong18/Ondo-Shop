using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MySystem.API.Extensions;
using MySystem.Service.Media;
using MySystem.Service.Models;
using MediaService = MySystem.Service.Media.Service;

namespace MySystem.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
[EnableRateLimiting("api")]
public class MediaController : ControllerBase
{
    private readonly IService _mediaService;

    public MediaController(IService mediaService)
    {
        _mediaService = mediaService;
    }

    /// <summary>Tải ảnh lên Cloudinary và trả về URL HTTPS cùng publicId.</summary>
    [HttpPost("upload-image")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MediaService.MaxImageSize + 64 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = MediaService.MaxImageSize + 64 * 1024)]
    public async Task<IActionResult> UploadImage([FromForm] Request.UploadImageRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediaService.UploadImageAsync(request.File, cancellationToken);
        return Ok(ApiResponseFactory.Base(result, message: "Tải ảnh lên thành công",
            traceId: HttpContext.TraceIdentifier));
    }

    /// <summary>Xóa ảnh Cloudinary theo publicId, bao gồm đường dẫn thư mục.</summary>
    [HttpDelete("delete-image")]
    [Authorize(Policy = JwtExtensions.AdminPolicy)]
    public async Task<IActionResult> DeleteImage([FromBody] Request.DeleteImageRequest request)
    {
        await _mediaService.DeleteImageAsync(request.PublicId);
        return Ok(ApiResponseFactory.Base(new { request.PublicId }, message: "Xóa ảnh thành công",
            traceId: HttpContext.TraceIdentifier));
    }
}
