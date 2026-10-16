namespace MySystem.Service.Auth;

public class Request
{
    /// <summary>
    /// Request đăng ký tài khoản mới
    /// </summary>
    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? Role { get; set; }
    }

    /// <summary>
    /// Request đăng nhập
    /// </summary>
    public class UpdateProfileRequest
    {
        [System.ComponentModel.DataAnnotations.Required, System.ComponentModel.DataAnnotations.StringLength(100)]
        public string FullName { get; set; } = string.Empty;
        [System.ComponentModel.DataAnnotations.Required, System.ComponentModel.DataAnnotations.EmailAddress,
         System.ComponentModel.DataAnnotations.StringLength(100)]
        public string Email { get; set; } = string.Empty;
        [System.ComponentModel.DataAnnotations.StringLength(20),
         System.ComponentModel.DataAnnotations.RegularExpression(@"^\+?[0-9() .\-]{7,20}$")]
        public string? PhoneNumber { get; set; }
        public DateOnly? DateOfBirth { get; set; }
    }
    public class LoginRequest
    {
        public string UsernameOrEmail { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request xác thực email bằng OTP (6 số)
    /// </summary>
    public class VerifyOtpRequest
    {
        public string Email { get; set; } = string.Empty;
        public string OtpCode { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request gửi lại OTP
    /// </summary>
    public class SendOtpRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request refresh token
    /// </summary>
    public class RefreshTokenRequest
    {
        public string RefreshToken { get; set; } = string.Empty;
    }
}
