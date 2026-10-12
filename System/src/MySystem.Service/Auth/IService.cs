using MySystem.Service.Models;
using UserResponse = MySystem.Service.Auth.Response.UserResponse;

namespace MySystem.Service.Auth;

public interface IService
{
    /// <summary>
    /// Đăng ký tài khoản mới + gửi OTP về email
    /// </summary>
    Task<string> Register(Request.RegisterRequest request);

    /// <summary>
    /// Đăng nhập — trả về AuthResultResponse (success hoặc requiresEmailVerification)
    /// </summary>
    Task<Response.AuthResultResponse> Login(Request.LoginRequest request, string ipAddress, string userAgent);

    /// <summary>
    /// Gửi OTP mới về email
    /// </summary>
    Task<string> SendOtp(Request.SendOtpRequest request);

    /// <summary>
    /// Xác thực OTP 6 số
    /// </summary>
    Task<Response.VerifyOtpResponse> VerifyOtp(Request.VerifyOtpRequest request, string ipAddress, string userAgent);

    /// <summary>
    /// Làm mới token
    /// </summary>
    Task<Response.LoginResponse> RefreshToken(Request.RefreshTokenRequest request, string ipAddress, string userAgent);

    /// <summary>
    /// Đăng xuất (Thu hồi Refresh Token)
    /// </summary>
    Task<BaseResponse> Logout(string refreshToken);

    /// <summary>
    /// Lấy thông tin người dùng theo ID
    /// </summary>
    Task<UserResponse> GetUserById(Guid userId);

    Task<UserResponse> UpdateProfile(Guid userId, Request.UpdateProfileRequest request);

    /// <summary>
    /// Cập nhật thông tin người dùng
    /// </summary>
    Task<BaseResponse> UpdateUser(Guid userId, Request.RegisterRequest request);

    /// <summary>
    /// Đổi mật khẩu
    /// </summary>
    Task<BaseResponse> ChangePassword(Guid userId, string currentPassword, string newPassword);
}
