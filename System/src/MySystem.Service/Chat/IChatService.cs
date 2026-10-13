namespace MySystem.Service.Chat;
public interface IChatService
{
    Task Connect(Guid userId, string connectionId);
    Task Disconnect(string connectionId);
    Task Sync(Guid userId, string connectionId);
    Task Send(Guid userId, string target, string message);
    Task CreateRoom(Guid userId, string name);
    Task JoinRoom(Guid userId, string code);
    Task RequestFriend(Guid userId, Guid targetId);
    Task RespondFriend(Guid userId, Guid requesterId, bool accept);
}
