using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace MySystem.Service.Media;

public class Request
{
    public class UploadImageRequest
    {
        [Required(ErrorMessage = "Vui lòng chọn ảnh cần tải lên.")]
        public IFormFile File { get; set; } = null!;
    }

    public class DeleteImageRequest
    {
        [Required(ErrorMessage = "Vui lòng cung cấp publicId của ảnh cần xóa.")]
        public string PublicId { get; set; } = string.Empty;
    }
}
