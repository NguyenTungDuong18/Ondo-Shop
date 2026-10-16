using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using MySystem.Service.Exceptions;

namespace MySystem.Service.Media;

public class Service : IService
{
    public const long MaxImageSize = 5 * 1024 * 1024;

    private readonly ICloudinaryUploadApi _cloudinary;
    private readonly CloudinaryOptions _options;

    public Service(ICloudinaryUploadApi cloudinary, IOptions<CloudinaryOptions> options)
    {
        _cloudinary = cloudinary;
        _options = options.Value;
    }

    public async Task<Response.UploadImageResult> UploadImageAsync(IFormFile file,
        CancellationToken cancellationToken = default)
    {
        await ValidateImageAsync(file, cancellationToken);
        await using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(Path.GetFileName(file.FileName), stream),
            Folder = _options.Folder,
            PublicId = Guid.NewGuid().ToString("N"),
            Overwrite = false
        };

        var result = await _cloudinary.UploadAsync(uploadParams, cancellationToken);
        if (result.Error != null || result.SecureUrl == null || result.SecureUrl.Scheme != Uri.UriSchemeHttps
            || string.IsNullOrWhiteSpace(result.PublicId))
            throw new ServerException("Không thể tải ảnh lên Cloudinary.", "CLOUDINARY_UPLOAD_FAILED");

        return new Response.UploadImageResult(result.SecureUrl.ToString(), result.PublicId);
    }

    public static async Task ValidateImageAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
        {
            throw new BadRequestException("Vui lòng chọn ảnh có nội dung.", "IMAGE_REQUIRED");
        }

        if (file.Length > MaxImageSize)
        {
            throw new BadRequestException("Dung lượng ảnh không được vượt quá 5 MB.", "IMAGE_TOO_LARGE");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var contentType = file.ContentType.ToLowerInvariant();
        var validType = extension switch
        {
            ".jpg" or ".jpeg" => contentType == "image/jpeg",
            ".png" => contentType == "image/png",
            ".gif" => contentType == "image/gif",
            ".webp" => contentType == "image/webp",
            _ => false
        };

        if (!validType)
        {
            throw new BadRequestException("Chỉ hỗ trợ ảnh JPG, JPEG, PNG, GIF hoặc WEBP.", "INVALID_IMAGE_TYPE");
        }

        // Check the file signature as well as the client-supplied filename and MIME type.
        await using (var validationStream = file.OpenReadStream())
        {
            var header = new byte[12];
            var bytesRead = await validationStream.ReadAtLeastAsync(header, header.Length,
                throwOnEndOfStream: false, cancellationToken: cancellationToken);
            if (!HasImageSignature(header.AsSpan(0, bytesRead), extension))
            {
                throw new BadRequestException("Nội dung file không đúng định dạng ảnh.", "INVALID_IMAGE_CONTENT");
            }
        }

    }

    public async Task DeleteImageAsync(string publicId)
    {
        if (string.IsNullOrWhiteSpace(publicId))
        {
            throw new BadRequestException("Vui lòng cung cấp publicId của ảnh cần xóa.", "IMAGE_PUBLIC_ID_REQUIRED");
        }

        var result = await _cloudinary.DestroyAsync(new DeletionParams(publicId)
        {
            ResourceType = ResourceType.Image,
            Type = "upload",
            Invalidate = true
        });

        if (result.Error != null)
        {
            throw new ServerException("Không thể xóa ảnh trên Cloudinary.", "CLOUDINARY_DELETE_FAILED");
        }

        if (result.Result == "not found")
        {
            throw new NotFoundException("Không tìm thấy ảnh trên Cloudinary.", "CLOUDINARY_IMAGE_NOT_FOUND");
        }

        if (result.Result != "ok")
        {
            throw new ServerException("Không thể xóa ảnh trên Cloudinary.", "CLOUDINARY_DELETE_FAILED");
        }
    }

    private static bool HasImageSignature(ReadOnlySpan<byte> header, string extension) => extension switch
    {
        ".jpg" or ".jpeg" => header.StartsWith(new byte[] { 0xff, 0xd8, 0xff }),
        ".png" => header.StartsWith(new byte[] { 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a }),
        ".gif" => header.StartsWith("GIF87a"u8) || header.StartsWith("GIF89a"u8),
        ".webp" => header.Length >= 12 && header[..4].SequenceEqual("RIFF"u8)
                   && header[8..12].SequenceEqual("WEBP"u8),
        _ => false
    };
}
