using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MySystem.Repository.Entities;

namespace MySystem.Repository.Configurations;

public class ChatParticipantConfiguration : IEntityTypeConfiguration<ChatParticipant>
{
    public void Configure(EntityTypeBuilder<ChatParticipant> b)
    {
        b.HasKey(x => x.UserId);
        b.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}
public class ChatRoomConfiguration : IEntityTypeConfiguration<ChatRoom>
{
    public void Configure(EntityTypeBuilder<ChatRoom> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Name).HasMaxLength(80);
        b.Property(x => x.InviteCode).HasMaxLength(6);
        b.HasIndex(x => x.InviteCode);
    }
}
public class ChatRoomMemberConfiguration : IEntityTypeConfiguration<ChatRoomMember>
{
    public void Configure(EntityTypeBuilder<ChatRoomMember> b)
    {
        b.HasKey(x => new { x.RoomId, x.UserId });
        b.HasOne(x => x.Room).WithMany().HasForeignKey(x => x.RoomId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}
public class ChatFriendshipConfiguration : IEntityTypeConfiguration<ChatFriendship>
{
    public void Configure(EntityTypeBuilder<ChatFriendship> b)
    {
        b.HasKey(x => new { x.RequesterId, x.RecipientId });
        b.HasOne(x => x.Requester).WithMany().HasForeignKey(x => x.RequesterId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne(x => x.Recipient).WithMany().HasForeignKey(x => x.RecipientId).OnDelete(DeleteBehavior.Restrict);
    }
}
public class ChatEntryConfiguration : IEntityTypeConfiguration<ChatEntry>
{
    public void Configure(EntityTypeBuilder<ChatEntry> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Text).HasMaxLength(4000);
        b.HasOne(x => x.Sender).WithMany().HasForeignKey(x => x.SenderId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne(x => x.Receiver).WithMany().HasForeignKey(x => x.ReceiverId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne(x => x.Room).WithMany().HasForeignKey(x => x.RoomId).OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(x => new { x.RoomId, x.SentAt });
        b.HasIndex(x => new { x.ReceiverId, x.SenderId, x.SentAt });
    }
}
