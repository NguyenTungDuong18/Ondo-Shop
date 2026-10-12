using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MySystem.Repository;
using CategoryEntity = MySystem.Repository.Entities.Category;
using ProductEntity = MySystem.Repository.Entities.Product;
using MySystem.Service.Exceptions;

namespace MySystem.Service.Category;

public class Service : IService
{
    private readonly AppDbContext _dbContext;

    public Service(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<Response.CategoryResponse>> GetCategories(bool activeOnly = false)
    {
        var query = _dbContext.Categories.Where(x => !x.IsDeleted).AsNoTracking();

        if (activeOnly)
            query = query.Where(x => x.IsActive);

        var categories = await query
            .OrderBy(x => x.DisplayOrder)
            .ThenBy(x => x.Name)
            .ToListAsync();

        var result = new List<Response.CategoryResponse>();
        foreach (var cat in categories)
        {
            var productCount = await _dbContext.Products.Where(p => !p.IsDeleted).AsNoTracking()
                .CountAsync(p => p.CategoryId == cat.Id && p.Status == "Active");

            result.Add(MapToResponse(cat, productCount));
        }

        return result;
    }

    public async Task<Response.CategoryResponse> GetCategoryById(Guid id)
    {
        var category = await _dbContext.Categories.Where(x => !x.IsDeleted)
            .Include(x => x.Products)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (category == null)
            throw new NotFoundException($"Danh mục không tìm thấy");

        return MapToResponse(category, category.Products.Count(p => p.Status == "Active" && !p.IsDeleted));
    }

    public async Task<Response.CategoryResponse> CreateCategory(Request.CreateCategoryRequest request)
    {
        var slug = request.Slug ?? GenerateSlug(request.Name);

        var existing = await _dbContext.Categories.FirstOrDefaultAsync(x => x.Slug == slug && !x.IsDeleted);
        if (existing != null)
            throw new BadRequestException($"Slug '{slug}' đã tồn tại");

        var category = new CategoryEntity
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Slug = slug,
            Description = request.Description,
            DisplayOrder = request.DisplayOrder,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.Categories.AddAsync(category);
        await _dbContext.SaveChangesAsync();
        return MapToResponse(category, 0);
    }

    public async Task<Response.CategoryResponse> UpdateCategory(Guid id, Request.UpdateCategoryRequest request)
    {
        var category = await _dbContext.Categories.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (category == null)
            throw new NotFoundException($"Danh mục không tìm thấy");

        var slug = request.Slug ?? GenerateSlug(request.Name);
        if (slug != category.Slug)
        {
            var existing = await _dbContext.Categories.FirstOrDefaultAsync(x => x.Slug == slug && x.Id != id && !x.IsDeleted);
            if (existing != null)
                throw new BadRequestException($"Slug '{slug}' đã tồn tại");
        }

        category.Name = request.Name;
        category.Slug = slug;
        category.Description = request.Description;
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        _dbContext.Categories.Update(category);
        await _dbContext.SaveChangesAsync();

        var productCount = await _dbContext.Products.Where(p => !p.IsDeleted).AsNoTracking()
            .CountAsync(p => p.CategoryId == category.Id && p.Status == "Active");

        return MapToResponse(category, productCount);
    }

    public async Task<bool> DeleteCategory(Guid id)
    {
        var category = await _dbContext.Categories.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (category == null)
            throw new NotFoundException($"Danh mục không tìm thấy");

        // Check if category has products
        var hasProducts = await _dbContext.Products.Where(p => !p.IsDeleted).AsNoTracking()
            .AnyAsync(p => p.CategoryId == id);

        if (hasProducts)
            throw new BadRequestException("Không thể xóa danh mục đã có sản phẩm");

        category.IsDeleted = true;
        category.UpdatedAt = DateTime.UtcNow;
        _dbContext.Categories.Update(category);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    private static Response.CategoryResponse MapToResponse(CategoryEntity category, int productCount) => new()
    {
        Id = category.Id,
        Name = category.Name,
        Slug = category.Slug,
        Description = category.Description,
        DisplayOrder = category.DisplayOrder,
        IsActive = category.IsActive,
        ProductCount = productCount,
        CreatedAt = category.CreatedAt,
        UpdatedAt = category.UpdatedAt
    };

    private static string GenerateSlug(string name)
    {
        var slug = name.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("đ", "d")
            .Replace("á", "a").Replace("à", "a").Replace("ã", "a")
            .Replace("é", "e").Replace("è", "e").Replace("ê", "e")
            .Replace("í", "i").Replace("ì", "i")
            .Replace("ó", "o").Replace("ò", "o").Replace("õ", "o").Replace("ô", "o").Replace("ơ", "o")
            .Replace("ú", "u").Replace("ù", "u").Replace("ư", "u");

        return new string(slug.Where(c => char.IsLetterOrDigit(c) || c == '-').ToArray()).Trim('-');
    }
}
