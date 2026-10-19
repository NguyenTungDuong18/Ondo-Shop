using Microsoft.Extensions.DependencyInjection.Extensions;
using MySystem.Service.Chat.Connections;
using MySystem.Service.Chat.Infrastructure;

namespace MySystem.API.Extensions;

/// <summary>Đăng ký khối kết nối; không đăng ký nghiệp vụ gửi tin, phòng hoặc kết bạn.</summary>
public static class ChatConnectionServiceCollectionExtensions
{
    public static IServiceCollection AddChatConnectionServices(this IServiceCollection services)
    {
        services.AddChatStateServices();

        // Singleton riêng của kết nối: giữ khóa qua nhiều scope nhưng không dùng bộ khóa của phòng/kết bạn.
        services.TryAddSingleton<ChatWriteCoordinator<ChatConnectionService>>();
        services.TryAddScoped<IChatConnectionService, ChatConnectionService>();
        return services;
    }
}
