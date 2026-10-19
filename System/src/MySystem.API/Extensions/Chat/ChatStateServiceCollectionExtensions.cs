using Microsoft.Extensions.DependencyInjection.Extensions;
using MySystem.Service.Chat.State;

namespace MySystem.API.Extensions;

/// <summary>Đăng ký khối snapshot; chỉ cần lịch sử, presence và cổng gửi realtime.</summary>
public static class ChatStateServiceCollectionExtensions
{
    public static IServiceCollection AddChatStateServices(this IServiceCollection services)
    {
        services.AddChatHistoryServices();
        services.AddChatPresenceServices();
        services.AddChatRealtimeServices();
        services.TryAddScoped<IChatStateService, ChatStateService>();
        return services;
    }
}
