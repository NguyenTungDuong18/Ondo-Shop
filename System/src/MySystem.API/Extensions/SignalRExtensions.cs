using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using MySystem.Service.Chat;

namespace MySystem.API.Extensions;

/// <summary>
/// Lớp chứa các extension methods cấu hình SignalR và CORS liên quan.
/// Giúp giữ cho Program.cs sạch sẽ, dễ đọc và tuân thủ nguyên tắc Single Responsibility.
/// </summary>
public static class SignalRExtensions
{
    public const string SignalRPolicyName = "SignalRPolicy";

    /// <summary>
    /// Đăng ký các dịch vụ cần thiết cho SignalR và cấu hình CORS riêng cho FE React dev.
    /// </summary>
    public static void AddSignalRServices(this IServiceCollection services)
    {
        // 1. Đăng ký dịch vụ CORS Policy đặc thù cho SignalR.
        // SignalR yêu cầu AllowCredentials() để gửi cookies/access-tokens (nếu có),
        // và không thể dùng AllowAnyOrigin() khi đi kèm với AllowCredentials().
        // Do đó, chúng ta cấu hình tường minh các domain/port của Frontend.
        services.AddCors(options =>
        {
            options.AddPolicy(SignalRPolicyName, policy =>
            {
                policy.WithOrigins(
                        "http://localhost:5173",  // Cổng mặc định của Vite React
                        "http://localhost:5174",  // Cổng fallback nếu 5173 bị chiếm
                        "http://127.0.0.1:5173",
                        "http://127.0.0.1:5174"
                      )
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials(); // Rất quan trọng với SignalR
            });
        });

        // Đăng ký ChatService dạng Singleton để duy trì danh sách online và mapping connection
        services.AddSingleton<IChatService, ChatService>();

        // 2. Đăng ký dịch vụ SignalR vào hệ thống DI Container.
        services.AddSignalR();
    }

    /// <summary>
    /// Map đường dẫn Hub của SignalR vào Endpoint routing pipeline của ASP.NET Core.
    /// </summary>
    /// <param name="app">IEndpointRouteBuilder đại diện cho WebApplication</param>
    public static void MapSignalRHubs(this IEndpointRouteBuilder app)
    {
        // Map ChatHub tới URL path "/hubs/chat".
        // Áp dụng CORS policy "SignalRPolicy" riêng cho endpoint này để bảo vệ khỏi tấn công Cross-Origin.
        app.MapHub<ChatHub>("/hubs/chat")
           .RequireCors(SignalRPolicyName);
    }
}
