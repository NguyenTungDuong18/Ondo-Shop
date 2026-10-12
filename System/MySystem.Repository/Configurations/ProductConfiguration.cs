using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MySystem.Repository.Entities;

namespace MySystem.Repository.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.SKU)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(x => x.SKU)
            .IsUnique();

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .HasMaxLength(1000);

        builder.Property(x => x.Price)
            .HasPrecision(18, 2);

        builder.Property(x => x.OriginalPrice)
            .HasPrecision(18, 2);

        builder.Property(x => x.Category)
            .HasMaxLength(100);

        builder.Property(x => x.Status)
            .HasMaxLength(30)
            .HasDefaultValue("Active");

        builder.Property(x => x.StockQuantity)
            .HasDefaultValue(0);

        // Indexes for common queries
        builder.HasIndex(x => x.Category);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.Price);
    }
}
