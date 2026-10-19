using Microsoft.Extensions.DependencyInjection.Extensions;
using MySystem.Service.Chat.Infrastructure;
using MySystem.Service.Chat.Rooms;

namespace MySystem.API.Extensions;

/// <summary>Đăng ký khối phòng với bộ khóa và hạn mức thử mã riêng.</summary>
public static class ChatRoomServiceCollectionExtensions
{
    public static IServiceCollection AddChatRoomServices(this IServiceCollection services)
    {
        services.AddChatStateServices();
        services.TryAddSingleton<TimeProvider>(TimeProvider.System);

        // Hai singleton này chỉ phục vụ phòng, không giữ DbContext hay state của invocation.
        services.TryAddSingleton<ChatWriteCoordinator<ChatRoomService>>();
        services.TryAddSingleton<ChatJoinLimiter>();
        services.TryAddScoped<IChatRoomService, ChatRoomService>();
        return services;
    }
}
