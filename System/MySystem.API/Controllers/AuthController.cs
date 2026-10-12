using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MySystem.API.Extensions;
using MySystem.Service.Models;
using MySystem.Service.Auth;
using MySystem.Service.Exceptions;
using MySystem.Service.JwtService;
using AuthRequest = MySystem.Service.Auth.Request;

namespace MySystem.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IService _authService;
    private readonly JwtOption _jwtOption;

    public AuthController(IService authService, JwtOption jwtOption)
    {
        _authService = authService;
        _jwtOption = jwtOption;
    }

    /// <summary>
    /// Đăng ký tài khoản mới + gửi OTP về email
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] AuthRequest.RegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.Register(request);
        return Ok(ApiResponseFactory.Base(result, true, "Đăng ký tài khoản thành công", HttpContext.TraceIdentifier));
    }

    /// <summary>
    /// Đăng nhập — trả về requiresEmailVerification nếu chưa xác thực email
    /// </summary>
    [EnableRateLimiting("login")]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthRequest.LoginRequest request, CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        var userAgent = Request.Headers["User-Agent"].ToString() ?? "Unknown";

        var result = await _authService.Login(request, ipAddress, userAgent);

        if (result.RequiresEmailVerification)
        {
            // Chưa verify → trả về flag để FE xử lý chuyển sang trang OTP
            return Ok(ApiResponseFactory.Base(result, true, "Tài khoản chưa xác thực email. Mã OTP đã được gửi.", HttpContext.TraceIdentifier));
        }

        // Đã verify → set cookie token như bình thường
        SetTokenCookies(result.LoginData!.Token, result.LoginData.RefreshToken, result.LoginData.ExpiresAt);

        return Ok(ApiResponseFactory.Base(result.LoginData, true, "Đăng nhập thành công", HttpContext.TraceIdentifier));
    }

    /// <summary>
    /// Gửi OTP mới về email
    /// </summary>
    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] AuthRequest.SendOtpRequest request)
    {
        var result = await _authService.SendOtp(request);
        return Ok(ApiResponseFactory.Base(result, true, "Đã gửi mã OTP", HttpContext.TraceIdentifier));
    }

    /// <summary>
    /// Xác thực OTP 6 số — thành công thì set cookies + token
    /// </summary>
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] AuthRequest.VerifyOtpRequest request, CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        var userAgent = Request.Headers["User-Agent"].ToString() ?? "Unknown";

        var result = await _authService.VerifyOtp(request, ipAddress, userAgent);

        // Set cookies khi verify thành công
        SetTokenCookies(result.Token, result.RefreshToken, result.ExpiresAt);

        return Ok(ApiResponseFactory.Base(result, true, "Xác thực email thành công", HttpContext.TraceIdentifier));
    }

    /// <summary>
    /// Làm mới token
    /// </summary>
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] AuthRequest.RefreshTokenRequest? request)
    {
        var refreshToken = request?.RefreshToken;
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            Request.Cookies.TryGetValue(JwtExtensions.RefreshTokenCookieName, out refreshToken);
        }

        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            throw new UnauthorizedException("Không tìm thấy Refresh Token");
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        var userAgent = Request.Headers["User-Agent"].ToString() ?? "Unknown";

        var result = await _authService.RefreshToken(
            new AuthRequest.RefreshTokenRequest { RefreshToken = refreshToken },
            ipAddress, userAgent);

        SetTokenCookies(result.Token, result.RefreshToken, result.ExpiresAt);

        return Ok(ApiResponseFactory.Base(result, true, "Làm mới token thành công", HttpContext.TraceIdentifier));
    }

    /// <summary>
    /// Đăng xuất — thu hồi refresh token + xóa cookies
    /// </summary>
    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        Request.Cookies.TryGetValue(JwtExtensions.RefreshTokenCookieName, out var refreshToken);
        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            await _authService.Logout(refreshToken);
        }
        Response.Cookies.Delete(JwtExtensions.AccessTokenCookieName);
        Response.Cookies.Delete(JwtExtensions.RefreshTokenCookieName);
        return Ok(ApiResponseFactory.Base(null, true, "Đăng xuất thành công", HttpContext.TraceIdentifier));
    }

    /// <summary>
    /// Lấy thông tin người dùng hiện tại
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedException("Thông tin xác thực không hợp lệ");
        }

        var user = await _authService.GetUserById(userId);
        return Ok(ApiResponseFactory.Base(user, true, "Lấy thông tin người dùng thành công", HttpContext.TraceIdentifier));
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] AuthRequest.UpdateProfileRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedException("Invalid authentication information");
        }

        var user = await _authService.UpdateProfile(userId, request);
        return Ok(ApiResponseFactory.Base(user, true, "Profile updated successfully", HttpContext.TraceIdentifier));
    }
    private void SetTokenCookies(string accessToken, string refreshToken, DateTime expiresAt)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Expires = expiresAt
        };
        Response.Cookies.Append(JwtExtensions.AccessTokenCookieName, accessToken, cookieOptions);

        Response.Cookies.Append(JwtExtensions.RefreshTokenCookieName, refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Expires = DateTime.UtcNow.AddDays(_jwtOption.RefreshTokenExpirationDays)
        });
    }
}
