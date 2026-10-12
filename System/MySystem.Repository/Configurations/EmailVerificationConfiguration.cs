using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MySystem.Repository.Entities;

namespace MySystem.Repository.Configurations;

public class EmailVerificationConfiguration : IEntityTypeConfiguration<EmailVerification>
{
    public void Configure(EntityTypeBuilder<EmailVerification> builder)
    {
        builder.ToTable("EmailVerifications");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.OtpCode)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(x => x.ExpiredAt)
            .IsRequired();

        builder.Property(x => x.Attempts)
            .HasDefaultValue(0);

        builder.Property(x => x.IsVerified)
            .HasDefaultValue(false);

        builder.HasOne(x => x.User)
            .WithMany(u => u.EmailVerifications)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.OtpCode);
        builder.HasIndex(x => x.ExpiredAt);
    }
}
