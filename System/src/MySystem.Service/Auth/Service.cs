using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MySystem.Repository;
using MySystem.Repository.Entities;
using MySystem.Service.Exceptions;
using MySystem.Service.JwtService;
using MySystem.Service.Models;
using MySystem.Service.Mail;
using UserResponse = MySystem.Service.Auth.Response.UserResponse;

namespace MySystem.Service.Auth;

public class Service : IService
{
    private readonly AppDbContext _dbContext;
    private readonly IJwtService _jwtService;
    private readonly IMailService _mailService;
    private readonly JwtOption _jwtOption;

    private const int OtpLength = 6;
    private const int OtpExpirationMinutes = 5;
    private const int MaxResendPerWindowMinutes = 5;
    private const int MaxResendPerWindow = 3;

    public Service(AppDbContext dbContext, IJwtService jwtService, IMailService mailService, JwtOption jwtOption)
    {
        _dbContext = dbContext;
        _jwtService = jwtService;
        _mailService = mailService;
        _jwtOption = jwtOption;
    }

    private string GenerateAccessToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("FullName", user.FullName ?? string.Empty)
        };
        return _jwtService.GenerateAccessToken(claims);
    }

    private static string GenerateOtpCode()
    {
        var random = new Random();
        return random.Next(0, 999999).ToString("D6");
    }

    private string BuildOtpEmailBody(string otpCode, DateTime expiredAt)
    {
        var minutesLeft = (int)Math.Ceiling((expiredAt - DateTime.UtcNow).TotalMinutes);
        return $@"
<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;'>
    <div style='background-color: #4F46E5; color: white; padding: 20px; text-align: center;'>
        <h2>Xác thực email của bạn</h2>
    </div>
    <div style='padding: 30px 20px; line-height: 1.6; color: #333; text-align: center;'>
        <p style='font-size: 16px;'>Mã xác thực của bạn là:</p>
        <div style='font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #4F46E5; margin: 20px 0; font-family: monospace;'>
            {otpCode}
        </div>
        <p style='font-size: 14px; color: #666;'>Mã này có hiệu lực trong <strong>{minutesLeft} phút</strong>.</p>
        <p style='font-size: 12px; color: #999; margin-top: 20px;'>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
    </div>
</div>";
    }

    public async Task<string> Register(Request.RegisterRequest request)
    {
        var existingUsername = await _dbContext.Users.FirstOrDefaultAsync(
            x => x.Username.ToLower() == request.Username.ToLower() && !x.IsDeleted);

        if (existingUsername != null)
            throw new BadRequestException($"Tên đăng nhập '{request.Username}' đã tồn tại");

        var existingEmail = await _dbContext.Users.FirstOrDefaultAsync(
            x => x.Email.ToLower() == request.Email.ToLower() && !x.IsDeleted);

        if (existingEmail != null)
            throw new BadRequestException($"Email '{request.Email}' đã được đăng ký");

        using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = request.Username,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                Role = string.IsNullOrWhiteSpace(request.Role)
                    ? UserRole.Customer
                    : Enum.TryParse<UserRole>(request.Role, true, out var r) ? r : UserRole.Customer,
                IsVerify = false,
                CreatedAt = DateTime.UtcNow
            };

            await _dbContext.Users.AddAsync(user);

            // Tạo OTP record
            var otpCode = GenerateOtpCode();
            var expiredAt = DateTime.UtcNow.AddMinutes(OtpExpirationMinutes);
            var emailVerification = new EmailVerification
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                OtpCode = otpCode,
                ExpiredAt = expiredAt,
                Attempts = 0,
                IsVerified = false,
                CreatedAt = DateTime.UtcNow
            };
            await _dbContext.EmailVerifications.AddAsync(emailVerification);
            await _dbContext.SaveChangesAsync();

            // Gửi email OTP
            await _mailService.SendMail(new MailContent
            {
                To = user.Email,
                Subject = "Mã xác thực MySystem - Đăng ký tài khoản",
                Body = BuildOtpEmailBody(otpCode, expiredAt)
            });

            await transaction.CommitAsync();
            return $"Đăng ký thành công. Mã xác thực đã được gửi đến email '{user.Email}'. Mã có hiệu lực trong {OtpExpirationMinutes} phút.";
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<Response.AuthResultResponse> Login(Request.LoginRequest request, string ipAddress, string userAgent)
    {
        var normalizedInput = request.UsernameOrEmail.Trim().ToLower();

        var user = await _dbContext.Users.FirstOrDefaultAsync(
            x => (x.Username.ToLower() == normalizedInput || x.Email.ToLower() == normalizedInput) && !x.IsDeleted);

        if (user == null)
            throw new UnauthorizedException("Tài khoản hoặc mật khẩu không chính xác");

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
            throw new UnauthorizedException("Tài khoản hoặc mật khẩu không chính xác");

        // Nếu chưa verify email → gửi OTP + trả flag
        if (!user.IsVerify)
        {
            await SendOtpInternal(user);
            return new Response.AuthResultResponse
            {
                RequiresEmailVerification = true,
                Email = user.Email,
                LoginData = null
            };
        }

        var token = GenerateAccessToken(user);
        var refreshToken = await CreateAndSaveRefreshToken(user.Id, ipAddress, userAgent);

        return new Response.AuthResultResponse
        {
            RequiresEmailVerification = false,
            Email = null,
            LoginData = new Response.LoginResponse
            {
                User = MapUserToResponse(user),
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtOption.AccessTokenExpirationMinutes)
            }
        };
    }

    public async Task<string> SendOtp(Request.SendOtpRequest request)
    {
        var email = request.Email.Trim().ToLower();
        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Email.ToLower() == email && !x.IsDeleted);
        if (user == null)
            throw new NotFoundException("Không tìm thấy người dùng với email đã nhập");

        if (user.IsVerify)
            throw new BadRequestException("Tài khoản đã được xác thực.");

        return await SendOtpInternal(user);
    }

    private async Task<string> SendOtpInternal(User user)
    {
        var windowStart = DateTime.UtcNow.AddMinutes(-MaxResendPerWindowMinutes);

        var recentResendCount = await _dbContext.EmailVerifications
            .Where(x => x.UserId == user.Id && x.ResendAt != null && x.ResendAt >= windowStart)
            .CountAsync();

        if (recentResendCount >= MaxResendPerWindow)
            throw new BadRequestException($"Bạn đã gửi OTP quá nhiều lần. Vui lòng đợi {MaxResendPerWindowMinutes} phút trước khi thử lại.");

        var otpCode = GenerateOtpCode();
        var expiredAt = DateTime.UtcNow.AddMinutes(OtpExpirationMinutes);

        // Tạo bản ghi OTP mới
        var emailVerification = new EmailVerification
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            OtpCode = otpCode,
            ExpiredAt = expiredAt,
            Attempts = 0,
            IsVerified = false,
            ResendAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };
        await _dbContext.EmailVerifications.AddAsync(emailVerification);
        await _dbContext.SaveChangesAsync();

        await _mailService.SendMail(new MailContent
        {
            To = user.Email,
            Subject = "Mã xác thực MySystem",
            Body = BuildOtpEmailBody(otpCode, expiredAt)
        });

        return $"Đã gửi mã xác thực đến email '{user.Email}'. Mã có hiệu lực trong {OtpExpirationMinutes} phút.";
    }

    public async Task<Response.VerifyOtpResponse> VerifyOtp(Request.VerifyOtpRequest request, string ipAddress, string userAgent)
    {
        var email = request.Email.Trim().ToLower();
        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Email.ToLower() == email && !x.IsDeleted);
        if (user == null)
            throw new NotFoundException("Không tìm thấy người dùng.");

        // Tìm OTP hợp lệ: chưa verify, chưa hết hạn
        var emailVerification = await _dbContext.EmailVerifications
            .Where(x => x.UserId == user.Id && !x.IsVerified && x.ExpiredAt > DateTime.UtcNow)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync();

        if (emailVerification == null)
            throw new BadRequestException("Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.");

        // Kiểm tra số lần thử
        if (emailVerification.Attempts >= 3)
            throw new BadRequestException("Bạn đã nhập sai quá 3 lần. Vui lòng yêu cầu mã mới.");

        // Kiểm tra mã OTP
        if (emailVerification.OtpCode != request.OtpCode.Trim())
        {
            emailVerification.Attempts += 1;
            _dbContext.EmailVerifications.Update(emailVerification);
            await _dbContext.SaveChangesAsync();

            var attemptsLeft = 3 - emailVerification.Attempts;
            throw new BadRequestException($"Mã xác thực không đúng. Bạn còn {attemptsLeft} lần thử.");
        }

        using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            // Đánh dấu OTP đã xác thực
            emailVerification.IsVerified = true;
            emailVerification.VerifiedAt = DateTime.UtcNow;
            emailVerification.UpdatedAt = DateTime.UtcNow;
            _dbContext.EmailVerifications.Update(emailVerification);

            // Đánh dấu user đã verify
            user.IsVerify = true;
            user.UpdatedAt = DateTime.UtcNow;
            _dbContext.Users.Update(user);

            // Tạo token
            var token = GenerateAccessToken(user);
            var refreshToken = await CreateAndSaveRefreshToken(user.Id, ipAddress, userAgent);

            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return new Response.VerifyOtpResponse
            {
                User = MapUserToResponse(user),
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtOption.AccessTokenExpirationMinutes)
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<Response.LoginResponse> RefreshToken(Request.RefreshTokenRequest request, string ipAddress, string userAgent)
    {
        var storedToken = await _dbContext.RefreshTokens
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.RefreshTokenHash == request.RefreshToken && x.IsActive && !x.IsDeleted);

        if (storedToken == null)
            throw new UnauthorizedException("Refresh token không hợp lệ hoặc đã hết hạn.");

        if (storedToken.ExpiredAt < DateTime.UtcNow || storedToken.RevokedAt != null)
        {
            storedToken.IsActive = false;
            _dbContext.RefreshTokens.Update(storedToken);
            await _dbContext.SaveChangesAsync();
            throw new UnauthorizedException("Refresh token đã hết hạn hoặc bị thu hồi.");
        }

        // Thu hồi token cũ
        storedToken.RevokedAt = DateTime.UtcNow;
        storedToken.IsActive = false;
        _dbContext.RefreshTokens.Update(storedToken);

        var user = storedToken.User;
        var token = GenerateAccessToken(user);
        var newRefreshToken = await CreateAndSaveRefreshToken(user.Id, ipAddress, userAgent);

        return new Response.LoginResponse
        {
            User = MapUserToResponse(user),
            Token = token,
            RefreshToken = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtOption.AccessTokenExpirationMinutes)
        };
    }

    public async Task<BaseResponse> Logout(string refreshToken)
    {
        var storedToken = await _dbContext.RefreshTokens
            .FirstOrDefaultAsync(x => x.RefreshTokenHash == refreshToken && x.IsActive && !x.IsDeleted);

        if (storedToken != null)
        {
            storedToken.RevokedAt = DateTime.UtcNow;
            storedToken.IsActive = false;
            _dbContext.RefreshTokens.Update(storedToken);
            await _dbContext.SaveChangesAsync();
        }

        return new BaseResponse { Success = true, Message = "Đăng xuất thành công." };
    }

    public async Task<UserResponse> GetUserById(Guid userId)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId && !x.IsDeleted);
        if (user == null)
            throw new NotFoundException("Không tìm thấy người dùng");

        return MapUserToResponse(user);
    }

    public async Task<UserResponse> UpdateProfile(Guid userId, Request.UpdateProfileRequest request)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId && !x.IsDeleted);
        if (user == null)
            throw new NotFoundException("User not found");

        var email = request.Email.Trim().ToLowerInvariant();
        var fullName = request.FullName.Trim();
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(fullName))
            throw new BadRequestException("Full name and email are required");

        var emailInUse = await _dbContext.Users.AnyAsync(x => x.Id != userId && !x.IsDeleted && x.Email.ToLower() == email);
        if (emailInUse)
            throw new BadRequestException("Email is already in use");

        user.FullName = fullName;
        user.Email = email;
        user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();
        user.AvatarUrl = string.IsNullOrWhiteSpace(request.AvatarUrl) ? null : request.AvatarUrl.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();
        return MapUserToResponse(user);
    }
    public async Task<BaseResponse> UpdateUser(Guid userId, Request.RegisterRequest request)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId && !x.IsDeleted);
        if (user == null)
            throw new NotFoundException("Không tìm thấy người dùng");

        user.Username = request.Username;
        user.Email = request.Email;
        user.FullName = request.FullName;
        user.PhoneNumber = request.PhoneNumber;
        user.Role = string.IsNullOrWhiteSpace(request.Role)
            ? UserRole.Customer
            : Enum.TryParse<UserRole>(request.Role, true, out var r) ? r : UserRole.Customer;
        user.UpdatedAt = DateTime.UtcNow;

        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync();

        return new BaseResponse { Success = true, Message = "Cập nhật thông tin thành công" };
    }

    public async Task<BaseResponse> ChangePassword(Guid userId, string currentPassword, string newPassword)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId && !x.IsDeleted);
        if (user == null)
            throw new NotFoundException("Không tìm thấy người dùng");

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            throw new BadRequestException("Mật khẩu hiện tại không chính xác");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.UpdatedAt = DateTime.UtcNow;

        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync();

        return new BaseResponse { Success = true, Message = "Đổi mật khẩu thành công" };
    }

    private async Task<string> CreateAndSaveRefreshToken(Guid userId, string ipAddress, string userAgent)
    {
        var rawRefreshToken = _jwtService.GenerateRefreshToken();
        var refreshTokenEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            RefreshTokenHash = rawRefreshToken,
            UserId = userId,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            ExpiredAt = DateTime.UtcNow.AddDays(_jwtOption.RefreshTokenExpirationDays),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        await _dbContext.RefreshTokens.AddAsync(refreshTokenEntity);
        await _dbContext.SaveChangesAsync();
        return rawRefreshToken;
    }

    private static UserResponse MapUserToResponse(User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role.ToString(),
            PhoneNumber = user.PhoneNumber,
            AvatarUrl = user.AvatarUrl,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}
