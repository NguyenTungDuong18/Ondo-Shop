using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using MySystem.Service.Chat;
using MySystem.Service.Chat.Presence;
using MySystem.Service.Chat.Realtime;

namespace MySystem.API.Extensions;

/// <summary>
/// Các dependency hạ tầng tối thiểu. Không đăng ký nghiệp vụ ở đây;
/// mỗi khối chỉ gọi đúng nhóm phụ thuộc mà nó cần.
/// Host vẫn chịu trách nhiệm cấu hình AppDbContext và AddSignalR.
/// </summary>
internal static class ChatInfrastructureRegistrations
{
    internal static IServiceCollection AddChatAccessServices(this IServiceCollection services)
    {
        // Policy không giữ state, dùng DbContext của invocation để kiểm tra quyền tại DB.
        services.TryAddScoped<ChatAccess>();
        return services;
    }

    internal static IServiceCollection AddChatPresenceServices(this IServiceCollection services)
    {
        // Presence cần cùng một instance để đếm đúng các tab qua nhiều invocation.
        // Có thể đăng ký implementation Redis trước lời gọi này; TryAdd giữ implementation đó.
        services.TryAddSingleton<IChatPresence, InMemoryChatPresence>();
        return services;
    }

    internal static IServiceCollection AddChatRealtimeServices(this IServiceCollection services)
    {
        // Publisher chỉ giữ IHubContext singleton, không còn giữ query/DbContext scoped.
        services.TryAddSingleton<IChatPublisher, ChatPublisher>();
        return services;
    }

    internal static IServiceCollection AddChatOptions(this IServiceCollection services)
    {
        // TryAddEnumerable tránh đăng ký lặp validator khi nhiều khối cùng cần options.
        services.AddOptions<ChatOptions>().ValidateOnStart();
        services.TryAddEnumerable(ServiceDescriptor.Singleton<IValidateOptions<ChatOptions>, ChatOptionsValidator>());
        return services;
    }
}

/// <summary>Kiểm tra cấu hình ngay khi khởi động, trước khi nhận yêu cầu chat.</summary>
internal sealed class ChatOptionsValidator : IValidateOptions<ChatOptions>
{
    public ChatOptionsValidator() { }

    public ValidateOptionsResult Validate(string? name, ChatOptions options)
    {
        var errors = new List<string>();
        if (options.MaxHistoryPageSize is < 1 or > 1000)
            errors.Add("Chat:MaxHistoryPageSize must be between 1 and 1000.");
        if (options.InitialMessageLimit is < 1 or > 1000)
            errors.Add("Chat:InitialMessageLimit must be null or between 1 and 1000.");
        return errors.Count == 0 ? ValidateOptionsResult.Success : ValidateOptionsResult.Fail(errors);
    }
}
