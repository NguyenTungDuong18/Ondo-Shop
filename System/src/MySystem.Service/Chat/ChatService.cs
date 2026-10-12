using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace MySystem.Service.Chat;

/// <summary>
/// Thực thi các nghiệp vụ Chat Realtime cụ thể, tương tác trực tiếp với SignalR Hub thông qua IHubContext.
/// Nằm toàn bộ ở tầng Service (MySystem.Service) "đúng như các service khác".
/// </summary>
public class ChatService : IChatService
{
    private readonly IHubContext<ChatHub> _hubContext;
    private readonly ILogger<ChatService> _logger;

    // Ánh xạ bộ nhớ luồng an toàn: Username -> ConnectionId
    private readonly ConcurrentDictionary<string, string> _userConnections =
        new(StringComparer.OrdinalIgnoreCase);

    public ChatService(IHubContext<ChatHub> hubContext, ILogger<ChatService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task RegisterConnection(string username, string connectionId)
    {
        _userConnections[username] = connectionId;
        _logger.LogInformation("SignalR Service [Registered] User: {User}, ConnectionId: {ConnectionId}", username, connectionId);
        await BroadcastOnlineUsers();
    }

    public async Task RemoveConnection(string connectionId)
    {
        var item = _userConnections.FirstOrDefault(x => x.Value == connectionId);
        if (!string.IsNullOrEmpty(item.Key))
        {
            _userConnections.TryRemove(item.Key, out _);
            _logger.LogInformation("SignalR Service [Removed] User: {User}, ConnectionId: {ConnectionId}", item.Key, connectionId);
            await BroadcastOnlineUsers();
        }
    }

    public async Task SendGeneralMessage(string sender, string message)
    {
        _logger.LogInformation("SignalR Service [General Broadcast] From: {Sender}, Msg: {Message}", sender, message);
        await _hubContext.Clients.All.SendAsync("ReceiveMessage", sender, message);
    }

    public async Task SendPrivateMessage(string sender, string targetUser, string message)
    {
        _logger.LogInformation("SignalR Service [Private Message] From: {Sender} to {Receiver}: {Message}", sender, targetUser, message);

        if (_userConnections.TryGetValue(targetUser, out var targetConnectionId))
        {
            // Gửi riêng tới người nhận
            await _hubContext.Clients.Client(targetConnectionId).SendAsync("ReceivePrivateMessage", sender, targetUser, message);

            // Gửi ngược lại cho người gửi
            if (_userConnections.TryGetValue(sender, out var senderConnectionId))
            {
                if (senderConnectionId != targetConnectionId)
                {
                    await _hubContext.Clients.Client(senderConnectionId).SendAsync("ReceivePrivateMessage", sender, targetUser, message);
                }
            }
        }
        else
        {
            // Nếu người nhận offline, gửi tin nhắn hệ thống lỗi tới người gửi
            if (_userConnections.TryGetValue(sender, out var senderConnectionId))
            {
                await _hubContext.Clients.Client(senderConnectionId).SendAsync("ReceiveSystemMessage", $"Người dùng '{targetUser}' hiện không trực tuyến.");
            }
        }
    }

    public IEnumerable<string> GetOnlineUsers()
    {
        return _userConnections.Keys.ToList();
    }

    public string? GetUsernameByConnectionId(string connectionId)
    {
        return _userConnections.FirstOrDefault(x => x.Value == connectionId).Key;
    }

    /// <summary>
    /// Phát đi danh sách người dùng đang online tới tất cả các client.
    /// </summary>
    private async Task BroadcastOnlineUsers()
    {
        var onlineUsers = GetOnlineUsers().ToList();
        await _hubContext.Clients.All.SendAsync("UserListUpdated", onlineUsers);
    }
}
