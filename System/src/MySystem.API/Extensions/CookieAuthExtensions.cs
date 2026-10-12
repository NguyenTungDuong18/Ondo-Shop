using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using MySystem.Service.Models;
using UserResponse = MySystem.Service.Auth.Response.UserResponse;
using System.Security.Claims;
using System.Text.Json;

namespace MySystem.API.Extensions;

public static class CookieAuthExtensions
{
    public const string CookieName = "auth_cookie";

    public static IServiceCollection AddCookieAuthServices(this IServiceCollection services)
    {
        services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.Cookie.Name = CookieName;
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
                options.ExpireTimeSpan = TimeSpan.FromHours(24);
                options.SlidingExpiration = true;

                options.Events.OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    context.Response.ContentType = "application/json";
                    var result = ApiResponseFactory.Error("Unauthorized", 401, "Vui lòng đăng nhập để truy cập tài nguyên này.", "UNAUTHORIZED", null, context.HttpContext.TraceIdentifier);
                    return context.Response.WriteAsync(JsonSerializer.Serialize(result));
                };

                options.Events.OnRedirectToAccessDenied = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    context.Response.ContentType = "application/json";
                    var result = ApiResponseFactory.Error("Forbidden", 403, "Bạn không có quyền thực hiện thao tác này.", "FORBIDDEN", null, context.HttpContext.TraceIdentifier);
                    return context.Response.WriteAsync(JsonSerializer.Serialize(result));
                };
            });

        return services;
    }

    public static async Task SignInUserAsync(this HttpContext httpContext, UserResponse user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("FullName", user.FullName)
        };

        var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var authProperties = new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(24)
        };

        await httpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(claimsIdentity),
            authProperties);
    }

    public static async Task SignOutUserAsync(this HttpContext httpContext)
    {
        await httpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        httpContext.Response.Cookies.Delete(CookieName);
    }
}