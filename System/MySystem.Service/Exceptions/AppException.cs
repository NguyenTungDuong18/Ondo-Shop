namespace MySystem.Service.Exceptions;

public abstract class AppException : Exception
{
    public string Title { get; set; }
    public int StatusCode { get; set; }
    public string MessageCode { get; set; }

    protected AppException(string title, int statusCode, string messageCode, string detail)
        : base(detail)
    {
        Title = title;
        StatusCode = statusCode;
        MessageCode = messageCode;
    }
}

public class BadRequestException : AppException
{
    public BadRequestException(string detail, string messageCode = "BAD_REQUEST")
        : base("Yêu cầu không hợp lệ", 400, messageCode, detail)
    {
    }
}

public class NotFoundException : AppException
{
    public NotFoundException(string detail, string messageCode = "NOT_FOUND")
        : base("Không tìm thấy dữ liệu", 404, messageCode, detail)
    {
    }
}

public class UnauthorizedException : AppException
{
    public UnauthorizedException(string detail, string messageCode = "UNAUTHORIZED")
        : base("Không có quyền truy cập", 401, messageCode, detail)
    {
    }
}

public class ForbiddenException : AppException
{
    public ForbiddenException(string detail, string messageCode = "FORBIDDEN")
        : base("Bị từ chối truy cập", 403, messageCode, detail)
    {
    }
}

public class ServerException : AppException
{
    public ServerException(string detail = "Hệ thống gặp sự cố ngoài ý muốn. Vui lòng thử lại sau.", string messageCode = "INTERNAL_SERVER_ERROR")
        : base("Lỗi hệ thống", 500, messageCode, detail)
    {
    }
}
