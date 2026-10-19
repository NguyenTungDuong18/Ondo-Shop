using Microsoft.Extensions.DependencyInjection.Extensions;
using MySystem.Service.Chat.History;

namespace MySystem.API.Extensions;

/// <summary>Đăng ký riêng khối lịch sử; có thể dùng mà không cần SignalR/presence hoặc service ghi.</summary>
public static class ChatHistoryServiceCollectionExtensions
{
    public static IServiceCollection AddChatHistoryServices(this IServiceCollection services)
    {
        services.AddChatOptions();
        services.AddChatAccessServices();

        // Dù chỉ đọc, query vẫn phải dùng DbContext scoped, không giữ trong singleton.
        services.TryAddScoped<IChatHistoryService, ChatHistoryService>();
        return services;
    }
}
