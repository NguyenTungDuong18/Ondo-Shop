using Microsoft.Extensions.DependencyInjection.Extensions;
using MySystem.Service.Chat.Friendships;
using MySystem.Service.Chat.Infrastructure;

namespace MySystem.API.Extensions;

/// <summary>Đăng ký riêng khối kết bạn; khóa cặp người dùng không chung với khóa phòng/kết nối.</summary>
public static class ChatFriendshipServiceCollectionExtensions
{
    public static IServiceCollection AddChatFriendshipServices(this IServiceCollection services)
    {
        services.AddChatStateServices();
        services.TryAddSingleton<ChatWriteCoordinator<ChatFriendshipService>>();
        services.TryAddScoped<IChatFriendshipService, ChatFriendshipService>();
        return services;
    }
}
