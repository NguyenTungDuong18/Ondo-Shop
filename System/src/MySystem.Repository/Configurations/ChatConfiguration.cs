using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MySystem.Repository.Entities;
namespace MySystem.Repository.Configurations;
public class ChatRecordConfiguration : IEntityTypeConfiguration<ChatRecord>
{
    public void Configure(EntityTypeBuilder<ChatRecord> b)
    {
        b.ToTable("ChatRecords", t => {
            t.HasCheckConstraint("CK_ChatRecords_Type", "\"Type\" IN ('participant','room','membership','friendship','message')");
            t.HasCheckConstraint("CK_ChatRecords_Data", "jsonb_typeof(\"Data\") = 'object' AND \"SchemaVersion\" > 0");
        });
        b.HasKey(x => x.Id);
        b.Property(x => x.Type).HasMaxLength(24);
        b.Property(x => x.IdentityKey).HasMaxLength(80);
        b.Property(x => x.Status).HasMaxLength(24);
        b.Property(x => x.InviteCode).HasMaxLength(6);
        b.Property(x => x.Data).HasColumnType("jsonb");
        b.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne(x => x.Peer).WithMany().HasForeignKey(x => x.PeerId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne(x => x.Room).WithMany().HasForeignKey(x => x.RoomId).OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(x => new { x.Type, x.IdentityKey }).IsUnique();
        b.HasIndex(x => new { x.Type, x.UserId, x.CreatedAt, x.Id });
        b.HasIndex(x => new { x.Type, x.PeerId, x.UserId, x.CreatedAt, x.Id });
        b.HasIndex(x => new { x.Type, x.RoomId, x.CreatedAt, x.Id });
        b.HasIndex(x => new { x.Type, x.InviteCode, x.ExpiresAt });
    }
}
