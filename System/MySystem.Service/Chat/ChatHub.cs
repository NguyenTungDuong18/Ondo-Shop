using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MySystem.Service.Chat;

/// <summary>
/// Hub SignalR đóng vai trò làm cổng kết nối socket.
/// Nằm ở tầng Service để cấu trúc code đồng bộ với ChatService.
/// </summary>
public class ChatHub : Hub
{
    private readonly IChatService _chatService;
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(IChatService chatService, ILogger<ChatHub> logger)
    {
        _chatService = chatService;
        _logger = logger;
    }

    /// <summary>
    /// Nhận tin nhắn chat chung và ủy thác cho service gửi đi.
    /// </summary>
    public async Task SendMessage(string user, string message)
    {
        await _chatService.SendGeneralMessage(user, message);
    }

    /// <summary>
    /// Nhận tin nhắn chat riêng và ủy thác cho service gửi đi.
    /// </summary>
    public async Task SendPrivateMessage(string targetUser, string message)
    {
        var senderUser = _chatService.GetUsernameByConnectionId(Context.ConnectionId);
        if (string.IsNullOrEmpty(senderUser))
        {
            _logger.LogWarning("SignalR [Hub Warning] Không tìm thấy kết nối người gửi: {ConnectionId}", Context.ConnectionId);
            return;
        }

        await _chatService.SendPrivateMessage(senderUser, targetUser, message);
    }

    /// <summary>
    /// Kích hoạt khi Client kết nối thành công.
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var username = httpContext?.Request.Query["username"].ToString()?.Trim();

        if (string.IsNullOrEmpty(username))
        {
            _logger.LogWarning("SignalR [Hub Aborted] Thiếu tham số username: {ConnectionId}", Context.ConnectionId);
            Context.Abort();
            return;
        }

        await _chatService.RegisterConnection(username, Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Kích hoạt khi Client đóng kết nối.
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await _chatService.RemoveConnection(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}
