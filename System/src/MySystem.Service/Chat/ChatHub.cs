using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
namespace MySystem.Service.Chat;
[Authorize]
public class ChatHub(IChatService chat) : Hub
{
    private Guid UserId => Guid.TryParse(Context.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
        ? id : throw new HubException("Vui lòng đăng nhập để chat.");
    public Task Sync() => chat.Sync(UserId, Context.ConnectionId);
    public Task SendMessage(string target, string message) => chat.Send(UserId, target, message);
    public Task CreateRoom(string name) => chat.CreateRoom(UserId, name);
    public Task JoinRoom(string code) => chat.JoinRoom(UserId, code);
    public Task RequestFriend(string targetId) => chat.RequestFriend(UserId, ParseId(targetId));
    public Task AcceptFriend(string requesterId) => chat.RespondFriend(UserId, ParseId(requesterId), true);
    public Task DeclineFriend(string requesterId) => chat.RespondFriend(UserId, ParseId(requesterId), false);
    private static Guid ParseId(string value) => Guid.TryParse(value, out var id) ? id : throw new HubException("Người dùng không hợp lệ.");
    public override async Task OnConnectedAsync()
    {
        await chat.Connect(UserId, Context.ConnectionId);
        await base.OnConnectedAsync();
    }
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await chat.Disconnect(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}
