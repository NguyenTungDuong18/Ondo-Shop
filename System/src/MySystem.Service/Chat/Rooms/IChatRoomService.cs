namespace MySystem.Service.Chat.Rooms;

/// <summary>Khối phòng chat: quản lý mã mời và thành viên, không xử lý gửi tin hay kết bạn.</summary>
public interface IChatRoomService
{
    /// <summary>Tạo phòng, thêm người tạo làm thành viên và thông báo mở phòng.</summary>
    Task Create(Guid userId, string name, CancellationToken ct = default);

    /// <summary>Kiểm tra mã mời còn hạn và thêm thành viên nếu chưa tham gia.</summary>
    Task Join(Guid userId, string code, CancellationToken ct = default);
}
