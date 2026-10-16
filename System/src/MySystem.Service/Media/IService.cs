using Microsoft.AspNetCore.Http;

namespace MySystem.Service.Media;

public interface IService
{
    Task<Response.UploadImageResult> UploadImageAsync(IFormFile file, CancellationToken cancellationToken = default);
    Task DeleteImageAsync(string publicId);
}
