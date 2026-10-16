namespace MySystem.Service.Media;

public class Response
{
    public record UploadImageResult(string Url, string PublicId);
}
