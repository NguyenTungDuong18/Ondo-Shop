namespace MySystem.Service.Auth;

public class Response
{
    /// <summary>
    /// Response thông tin người dùng
    /// </summary>
    public class UserResponse
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// Response đăng nhập thành công
    /// </summary>
    public class LoginResponse
    {
        public UserResponse User { get; set; } = null!;
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }

    /// <summary>
    /// Response trả về khi đăng nhập thành công hoặc cần xác thực email
    /// </summary>
    public class AuthResultResponse
    {
        public bool RequiresEmailVerification { get; set; }
        public string? Email { get; set; }
        public LoginResponse? LoginData { get; set; }
    }

    /// <summary>
    /// Response xác thực OTP thành công
    /// </summary>
    public class VerifyOtpResponse
    {
        public UserResponse User { get; set; } = null!;
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }
}
