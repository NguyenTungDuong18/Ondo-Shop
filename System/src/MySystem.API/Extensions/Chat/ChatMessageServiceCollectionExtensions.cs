using Microsoft.Extensions.DependencyInjection.Extensions;
using MySystem.Service.Chat.Messages;

namespace MySystem.API.Extensions;

/// <summary>Đăng ký riêng khối gửi tin; không kéo theo service ghi phòng, kết bạn hay kết nối.</summary>
public static class ChatMessageServiceCollectionExtensions
{
    public static IServiceCollection AddChatMessageServices(this IServiceCollection services)
    {
        services.AddChatAccessServices();
        services.AddChatRealtimeServices();

        // Scoped vì service ghi tin sử dụng DbContext riêng theo invocation.
        services.TryAddScoped<IChatMessageService, ChatMessageService>();
        return services;
    }
}
