using Microsoft.EntityFrameworkCore;
using MySystem.Repository;
using MySystem.Repository.Entities;

namespace MySystem.API.Infrastructure;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext dbContext)
    {
        var now = DateTime.UtcNow;
        var admin = await EnsureUserAsync(dbContext, "admin", "admin@system.com", "Administrator System", UserRole.Admin, "0900000000", now);
        var minh = await EnsureUserAsync(dbContext, "minh.nguyen", "minh.nguyen@example.com", "Nguyễn Minh", UserRole.Customer, "0901234567", now);
        var linh = await EnsureUserAsync(dbContext, "linh.tran", "linh.tran@example.com", "Trần Ngọc Linh", UserRole.Customer, "0912345678", now);
        var an = await EnsureUserAsync(dbContext, "an.le", "an.le@example.com", "Lê Hoàng An", UserRole.Customer, "0987654321", now);

        var categorySeeds = new[]
        {
            new CategorySeed("Kitchen", "kitchen", "Objects for ritual and dining.", 1),
            new CategorySeed("Living", "living", "Objects for ambient, everyday living.", 2),
            new CategorySeed("Desk", "desk", "Tools for thoughtful workspaces.", 3),
            new CategorySeed("Bath", "bath", "Aromatics and wellness essentials.", 4),
            new CategorySeed("Accessories", "accessories", "Personal carry and daily objects.", 5)
        };

        var categories = new Dictionary<string, Category>(StringComparer.OrdinalIgnoreCase);
        foreach (var seed in categorySeeds)
        {
            var category = await dbContext.Categories.FirstOrDefaultAsync(x => x.Slug == seed.Slug && !x.IsDeleted);
            if (category is null)
            {
                category = new Category
                {
                    Id = Guid.NewGuid(),
                    Name = seed.Name,
                    Slug = seed.Slug,
                    Description = seed.Description,
                    DisplayOrder = seed.DisplayOrder,
                    IsActive = true,
                    CreatedAt = now
                };
                dbContext.Categories.Add(category);
            }
            categories[seed.Slug] = category;
        }
        await dbContext.SaveChangesAsync();
        await RemoveLegacyMockProductsAsync(dbContext, now);

        var productSeeds = new[]
        {
            new ProductSeed("SKU-ONDA-01", "Onda Matte Ceramic Teapot", "A high-fired ceramic teapot with a hand-applied matte glaze for slow afternoon tea.", 2100000m, 2400000m, 15, "kitchen", "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=85"),
            new ProductSeed("SKU-ONDA-02", "Washed Linen Throw Blanket", "Soft, breathable washed linen for a comfortable and lived-in living room.", 3500000m, 3900000m, 8, "living", "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=85"),
            new ProductSeed("SKU-ONDA-03", "Solid Walnut & Brass Desk Tray", "A solid walnut desk tray with a restrained brass detail for daily tools.", 1600000m, null, 20, "desk", "https://images.unsplash.com/photo-1585336261026-8f5786372966?auto=format&fit=crop&w=1200&q=85"),
            new ProductSeed("SKU-ONDA-04", "Minimalist Coffee Dripper Stand", "A sturdy powder-coated stand made for a calm pour-over ritual.", 1200000m, 1500000m, 12, "kitchen", "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=85"),
            new ProductSeed("SKU-ONDA-05", "Architectural Sculptural Table Lamp", "An ambient table lamp with frosted glass and a weighted metal base.", 4750000m, null, 5, "living", "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=85"),
            new ProductSeed("SKU-ONDA-06", "Handcrafted Ceramic Coffee Mug Set", "A set of two hand-finished ceramic mugs in a warm, quiet neutral palette.", 1300000m, null, 18, "kitchen", "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85"),
            new ProductSeed("SKU-ONDA-07", "Minimalist Cloth-bound Journal", "A cloth-bound journal with 200 pages of smooth 120gsm paper.", 1050000m, null, 25, "desk", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=85"),
            new ProductSeed("SKU-ONDA-08", "Cedar & Sandalwood Reed Diffuser", "A long-lasting cedar and sandalwood diffuser for a grounded room.", 1450000m, null, 14, "bath", "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=85"),
            new ProductSeed("SKU-ONDA-09", "Heavyweight Cotton Canvas Tote", "A 16oz cotton canvas tote with a laptop sleeve and vegetable-tanned leather handles.", 1850000m, 2100000m, 10, "accessories", "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85"),
            new ProductSeed("SKU-ONDA-10", "Smoked Glass Water Carafe", "A heat-resistant smoked glass carafe with an integrated drinking glass.", 1700000m, null, 9, "kitchen", "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85"),
            new ProductSeed("SKU-ONDA-11", "Solid Brass Key Ring Carabiner", "A CNC-finished solid brass carabiner that develops a soft patina over time.", 700000m, null, 30, "accessories", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85"),
            new ProductSeed("SKU-ONDA-12", "Minimalist Ceramic Flower Vase", "A sculptural ceramic vase designed to hold a single branch or a small seasonal arrangement.", 2600000m, null, 7, "living", "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=1200&q=85")
        };

        var products = new Dictionary<string, Product>(StringComparer.OrdinalIgnoreCase);
        foreach (var seed in productSeeds)
        {
            var product = await dbContext.Products.FirstOrDefaultAsync(x => x.SKU == seed.Sku && !x.IsDeleted);
            var category = categories[seed.CategorySlug];
            if (product is null)
            {
                product = new Product
                {
                    Id = Guid.NewGuid(),
                    SKU = seed.Sku,
                    Name = seed.Name,
                    Description = seed.Description,
                    Price = seed.Price,
                    OriginalPrice = seed.OriginalPrice,
                    StockQuantity = seed.StockQuantity,
                    Category = category.Name,
                    CategoryId = category.Id,
                    ImageUrl = seed.ImageUrl,
                    Status = seed.StockQuantity > 0 ? "Active" : "OutOfStock",
                    CreatedAt = now.AddDays(-products.Count)
                };
                dbContext.Products.Add(product);
            }
            else if (product.CategoryId != category.Id || !string.Equals(product.Category, category.Name, StringComparison.Ordinal))
            {
                product.CategoryId = category.Id;
                product.Category = category.Name;
                product.UpdatedAt = now;
            }
            products[seed.Sku] = product;
        }
        await dbContext.SaveChangesAsync();

        foreach (var product in products.Values)
        {
            if (!await dbContext.ProductImages.AnyAsync(x => x.ProductId == product.Id && !x.IsDeleted))
            {
                dbContext.ProductImages.Add(new ProductImage
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    ImageUrl = product.ImageUrl ?? string.Empty,
                    AltText = product.Name,
                    DisplayOrder = 1,
                    IsPrimary = true,
                    CreatedAt = product.CreatedAt
                });
            }
        }
        await dbContext.SaveChangesAsync();

        await EnsureOrderAsync(dbContext, "ORD-SEED-20260801-001", minh, OrderStatus.Delivered, "Delivered", now.AddDays(-18), ("SKU-ONDA-01", 1), ("SKU-ONDA-02", 1));
        await EnsureOrderAsync(dbContext, "ORD-SEED-20260807-002", linh, OrderStatus.Shipped, "In transit", now.AddDays(-12), ("SKU-ONDA-03", 1), ("SKU-ONDA-04", 2));
        await EnsureOrderAsync(dbContext, "ORD-SEED-20260813-003", an, OrderStatus.Pending, "Awaiting confirmation", now.AddDays(-6), ("SKU-ONDA-05", 1), ("SKU-ONDA-08", 1));
        await dbContext.SaveChangesAsync();

        await EnsureReviewAsync(dbContext, products["SKU-ONDA-01"], minh, 5, "Beautiful daily ritual", "The pour is clean and it keeps tea warm remarkably well.", true, now.AddDays(-14));
        await EnsureReviewAsync(dbContext, products["SKU-ONDA-02"], minh, 5, "Soft from day one", "The texture feels considered and gets better with use.", true, now.AddDays(-13));
        await EnsureReviewAsync(dbContext, products["SKU-ONDA-03"], linh, 5, "Exactly right", "A practical desk object with excellent finishing.", true, now.AddDays(-10));
        await EnsureReviewAsync(dbContext, products["SKU-ONDA-04"], linh, 4, "Well built", "Stable, compact, and easy to keep on the counter.", true, now.AddDays(-9));
        await EnsureReviewAsync(dbContext, products["SKU-ONDA-05"], an, 5, "Warm light", "It changes the feeling of the room in the evening.", false, now.AddDays(-4));
        await EnsureReviewAsync(dbContext, products["SKU-ONDA-08"], an, 4, "Calm fragrance", "Present but never overpowering.", false, now.AddDays(-3));
        await dbContext.SaveChangesAsync();
    }

    private static async Task RemoveLegacyMockProductsAsync(AppDbContext dbContext, DateTime now)
    {
        var legacyMockSkus = new[] { "PROD-001", "PROD-002" };
        var legacyProducts = await dbContext.Products
            .Where(x => legacyMockSkus.Contains(x.SKU) && !x.IsDeleted && x.CategoryId == null)
            .ToListAsync();

        foreach (var product in legacyProducts)
        {
            product.IsDeleted = true;
            product.UpdatedAt = now;
        }

        if (legacyProducts.Count > 0)
        {
            await dbContext.SaveChangesAsync();
        }
    }
    private static async Task<User> EnsureUserAsync(AppDbContext dbContext, string username, string email, string fullName, UserRole role, string phoneNumber, DateTime createdAt)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Username == username && !x.IsDeleted);
        if (user is not null)
        {
            if (!user.IsVerify)
            {
                user.IsVerify = true;
                user.UpdatedAt = createdAt;
            }
            return user;
        }

        user = new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            Email = email,
            FullName = fullName,
            PhoneNumber = phoneNumber,
            Role = role,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(role == UserRole.Admin ? "Admin@123" : "Customer@123"),
            IsVerify = true,
            CreatedAt = createdAt
        };
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();
        return user;
    }

    private static async Task EnsureOrderAsync(AppDbContext dbContext, string orderNumber, User user, OrderStatus status, string statusDescription, DateTime createdAt, params (string Sku, int Quantity)[] lines)
    {
        if (await dbContext.Orders.AnyAsync(x => x.OrderNumber == orderNumber && !x.IsDeleted)) return;

        var skus = lines.Select(x => x.Sku).ToList();
        var productBySku = await dbContext.Products.Where(x => skus.Contains(x.SKU) && !x.IsDeleted).ToDictionaryAsync(x => x.SKU);
        if (productBySku.Count != lines.Length) return;

        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = orderNumber,
            UserId = user.Id,
            Status = status,
            StatusDescription = statusDescription,
            ShippingName = user.FullName,
            ShippingPhone = user.PhoneNumber ?? "0900000000",
            ShippingAddress = "12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
            ShippingNote = "Please call before delivery.",
            CreatedAt = createdAt,
            ConfirmedAt = status is OrderStatus.Confirmed or OrderStatus.Processing or OrderStatus.Shipped or OrderStatus.Delivered ? createdAt.AddHours(3) : null,
            ShippedAt = status is OrderStatus.Shipped or OrderStatus.Delivered ? createdAt.AddDays(1) : null,
            DeliveredAt = status is OrderStatus.Delivered ? createdAt.AddDays(3) : null
        };

        var items = lines.Select(line =>
        {
            var product = productBySku[line.Sku];
            return new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                ProductSku = product.SKU,
                ProductImageUrl = product.ImageUrl,
                Quantity = line.Quantity,
                UnitPrice = product.Price,
                DiscountAmount = 0,
                CreatedAt = createdAt
            };
        }).ToList();

        var subtotal = items.Sum(x => x.UnitPrice * x.Quantity);
        order.ShippingFee = subtotal >= 500000m ? 0 : 30000m;
        order.TotalAmount = subtotal + order.ShippingFee;

        dbContext.Orders.Add(order);
        dbContext.OrderItems.AddRange(items);
    }

    private static async Task EnsureReviewAsync(AppDbContext dbContext, Product product, User user, int rating, string title, string comment, bool verifiedPurchase, DateTime createdAt)
    {
        if (await dbContext.ProductReviews.AnyAsync(x => x.ProductId == product.Id && x.UserId == user.Id && !x.IsDeleted)) return;

        dbContext.ProductReviews.Add(new ProductReview
        {
            Id = Guid.NewGuid(),
            ProductId = product.Id,
            UserId = user.Id,
            Rating = rating,
            Title = title,
            Comment = comment,
            IsVerifiedPurchase = verifiedPurchase,
            IsApproved = true,
            CreatedAt = createdAt
        });
    }

    private sealed record CategorySeed(string Name, string Slug, string Description, int DisplayOrder);
    private sealed record ProductSeed(string Sku, string Name, string Description, decimal Price, decimal? OriginalPrice, int StockQuantity, string CategorySlug, string ImageUrl);
}