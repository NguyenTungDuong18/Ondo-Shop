using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using MySystem.Service.Chat.Contracts;
using MySystem.Service.Chat.Connections;
using MySystem.Service.Chat.Friendships;
using MySystem.Service.Chat.History;
using MySystem.Service.Chat.Messages;
using MySystem.Service.Chat.Rooms;
using MySystem.Service.Chat.State;

namespace MySystem.Service.Chat;

/// <summary>
/// Cổng SignalR chỉ chuyển lời gọi đến interface của đúng khối.
/// Danh tính lấy từ JWT, không nhận userId của người thực hiện từ client.
/// </summary>
[Authorize]
public class ChatHub(IChatConnectionService connections, IChatMessageService messages,
    IChatRoomService rooms, IChatFriendshipService friendships, IChatHistoryService history, IChatStateService state) : Hub
{
    private Guid UserId => Guid.TryParse(Context.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
        ? id : throw new HubException("Vui lòng đăng nhập để chat.");

    // Khối đồng bộ và lịch sử: chỉ đọc dữ liệu mà người đang đăng nhập được phép xem.
    public Task Sync() => state.Sync(UserId, Context.ConnectionId, Context.ConnectionAborted);
    public Task<ChatMessagePage> GetMessages(string target, Guid? beforeMessageId = null, int limit = 50) =>
        history.GetMessages(UserId, target, beforeMessageId, limit, Context.ConnectionAborted);

    // Khối tin nhắn: kiểm tra nội dung/quyền và lưu trước khi phát tới người nhận.
    public Task SendMessage(string target, string message) => messages.Send(UserId, target, message, Context.ConnectionAborted);

    // Khối phòng: tự quản lý mã mời, hạn mức thử mã và membership.
    public Task CreateRoom(string name) => rooms.Create(UserId, name, Context.ConnectionAborted);
    public Task JoinRoom(string code) => rooms.Join(UserId, code, Context.ConnectionAborted);

    // Khối kết bạn: targetId/requesterId chỉ xác định đối tác, không thay danh tính người thao tác.
    public Task RequestFriend(string targetId) => friendships.Request(UserId, ParseId(targetId), Context.ConnectionAborted);
    public Task AcceptFriend(string requesterId) => friendships.Respond(UserId, ParseId(requesterId), true, Context.ConnectionAborted);
    public Task DeclineFriend(string requesterId) => friendships.Respond(UserId, ParseId(requesterId), false, Context.ConnectionAborted);

    private static Guid ParseId(string value) => Guid.TryParse(value, out var id) ? id : throw new HubException("Người dùng không hợp lệ.");
    // Khối kết nối: scope riêng cho mỗi invocation, presence vẫn theo dõi các tab trong cả process.
    public override async Task OnConnectedAsync()
    {
        await connections.Connect(UserId, Context.ConnectionId, Context.ConnectionAborted);
        await base.OnConnectedAsync();
    }
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Không dùng ConnectionAborted ở đây vì token đã bị hủy khi client ngắt kết nối.
        await connections.Disconnect(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}
