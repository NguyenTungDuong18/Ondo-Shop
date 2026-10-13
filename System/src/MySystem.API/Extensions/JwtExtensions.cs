using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using MySystem.Service.Exceptions;
using MySystem.Service.JwtService;

namespace MySystem.API.Extensions;

public static class JwtExtensions
{
    public const string AccessTokenCookieName = "accessToken";
    public const string RefreshTokenCookieName = "refreshToken";

    public const string AdminPolicy = "AdminPolicy";
    public const string CustomerPolicy = "CustomerPolicy";
    public const string CustomerOrAdminPolicy = "CustomerOrAdminPolicy";
    public const string StaffPolicy = "StaffPolicy";
    public const string StaffOrAdminPolicy = "StaffOrAdminPolicy";

    public static void AddJwtServices(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtOption = new JwtOption();
        configuration.GetSection(nameof(JwtOption)).Bind(jwtOption);
        var key = Encoding.UTF8.GetBytes(jwtOption.AccessTokenKey);

        services.AddSingleton(jwtOption);
        services.AddSingleton<IJwtService, MySystem.Service.JwtService.JwtService>();

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = jwtOption.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtOption.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,
                    NameClaimType = ClaimTypes.NameIdentifier,
                    RoleClaimType = ClaimTypes.Role
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        if (context.Request.Path.StartsWithSegments("/hubs/chat")
                            && context.Request.Query.TryGetValue("access_token", out var hubToken))
                        {
                            context.Token = hubToken.ToString();
                        }
                        // Ưu tiên đọc token từ Authorization Header
                        // Nếu không có, fallback đọc từ Cookie accessToken
                        if (string.IsNullOrWhiteSpace(context.Token)
                            && context.Request.Cookies.TryGetValue(AccessTokenCookieName, out var cookieToken)
                            && !string.IsNullOrWhiteSpace(cookieToken))
                        {
                            context.Token = cookieToken;
                        }
                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = context =>
                    {
                        // Token hết hạn hoặc lỗi auth khác
                        // Nếu là AllowAnonymous endpoint hoặc các route Auth (login, register, verify-otp...)
                        // -> Suppress failure, cho phép request đi tiếp dưới dạng vãng lai (Anonymous)
                        var endpoint = context.HttpContext.GetEndpoint();
                        var allowAnonymous = endpoint?.Metadata.GetMetadata<AllowAnonymousAttribute>() != null;
                        var path = context.Request.Path.Value?.ToLower() ?? "";

                        if (allowAnonymous || path.Contains("/api/v1/auth/"))
                        {
                            context.NoResult();
                            return Task.CompletedTask;
                        }

                        if (context.Exception is SecurityTokenExpiredException)
                            throw new ExpiredAccessTokenException();

                        if (context.Exception is SecurityTokenSignatureKeyNotFoundException)
                            throw new InvalidAccessTokenException();

                        return Task.CompletedTask;
                    },
                    OnChallenge = context =>
                    {
                        // Đây là bước cuối khi auth fails
                        // Nếu là AllowAnonymous hoặc route Auth -> KHÔNG throw 401
                        var endpoint = context.HttpContext.GetEndpoint();
                        var allowAnonymous = endpoint?.Metadata.GetMetadata<AllowAnonymousAttribute>() != null;
                        var path = context.Request.Path.Value?.ToLower() ?? "";

                        if (allowAnonymous || path.Contains("/api/v1/auth/"))
                        {
                            context.HandleResponse();
                            return Task.CompletedTask;
                        }

                        if (context.AuthenticateFailure is SecurityTokenExpiredException)
                            throw new ExpiredAccessTokenException();

                        throw new InvalidAccessTokenException();
                    }
                };
            });

        services.AddAuthorization(options =>
        {
            options.DefaultPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();

            options.AddPolicy(AdminPolicy, policy =>
                policy.RequireRole("Admin"));

            options.AddPolicy(CustomerPolicy, policy =>
                policy.RequireRole("Customer"));

            options.AddPolicy(CustomerOrAdminPolicy, policy =>
                policy.RequireRole("Customer", "Admin"));

            options.AddPolicy(StaffPolicy, policy =>
                policy.RequireRole("Staff"));

            options.AddPolicy(StaffOrAdminPolicy, policy =>
                policy.RequireRole("Staff", "Admin"));
        });
    }
}
