namespace MySystem.Service.Exceptions;

public class MissingAccessTokenException : AppException
{
    public MissingAccessTokenException()
        : base("Chưa đăng nhập", 401, "MissingAccessToken",
            "Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập lại.")
    { }
}

public class ExpiredAccessTokenException : AppException
{
    public ExpiredAccessTokenException()
        : base("Phiên làm việc hết hạn", 401, "ExpiredAccessToken",
            "Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.")
    { }
}

public class InvalidAccessTokenException : AppException
{
    public InvalidAccessTokenException()
        : base("Mã xác thực không hợp lệ", 401, "InvalidAccessToken",
            "Mã xác thực không hợp lệ. Vui lòng đăng nhập lại.")
    { }
}

public class ExpiredRefreshTokenException : AppException
{
    public ExpiredRefreshTokenException()
        : base("Phiên làm việc hết hạn", 401, "EXPIRED_REFRESH_TOKEN",
            "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.")
    { }
}
