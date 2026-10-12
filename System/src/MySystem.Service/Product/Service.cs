using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MySystem.Repository;
using MySystem.Service.Cache;
using MySystem.Service.Exceptions;
using MySystem.Service.Models;
using ProductEntity = MySystem.Repository.Entities.Product;

namespace MySystem.Service.Product;

public class Service : IService
{
    private readonly AppDbContext _dbContext;
    private readonly ICacheService _cacheService;
    private const string CachePrefix = "product_";

    public Service(
        AppDbContext dbContext,
        ICacheService cacheService)
    {
        _dbContext = dbContext;
        _cacheService = cacheService;
    }

    public async Task<Response.ProductListResponse> GetProducts(Request.ProductListRequest request)
    {
        var cacheKey = $"{CachePrefix}list_f={BuildFilterCacheKey(request.Filters)}_p={BuildPageCacheKey(request.Paginator)}";

        var cachedResult = await _cacheService.GetAsync<Response.ProductListResponse>(cacheKey);
        if (cachedResult != null)
        {
            return cachedResult;
        }

        var query = _dbContext.Products.Where(x => !x.IsDeleted).AsNoTracking();

        // Apply filters
        if (request.Filters != null)
        {
            if (request.Filters.Ids != null && request.Filters.Ids.Any())
            {
                query = query.Where(x => request.Filters.Ids.Contains(x.Id));
            }

            if (!string.IsNullOrWhiteSpace(request.Filters.Search))
            {
                var search = request.Filters.Search.Trim().ToLower();
                query = query.Where(x =>
                    x.Name.ToLower().Contains(search) ||
                    x.SKU.ToLower().Contains(search) ||
                    (x.Description != null && x.Description.ToLower().Contains(search)));
            }

            if (!string.IsNullOrWhiteSpace(request.Filters.Category))
            {
                var category = request.Filters.Category.Trim().ToLower();
                query = query.Where(x => x.Category.ToLower() == category);
            }

            if (request.Filters.CategoryId.HasValue)
            {
                query = query.Where(x => x.CategoryId == request.Filters.CategoryId.Value);
            }

            if (request.Filters.PriceFrom.HasValue)
            {
                query = query.Where(x => x.Price >= request.Filters.PriceFrom.Value);
            }

            if (request.Filters.PriceTo.HasValue)
            {
                query = query.Where(x => x.Price <= request.Filters.PriceTo.Value);
            }

            if (request.Filters.Status != null && request.Filters.Status.Any())
            {
                query = query.Where(x => request.Filters.Status.Contains(x.Status));
            }
        }

        var totalCount = await query.CountAsync();

        // Apply pagination
        var paginator = request.Paginator ?? new Request.ProductPaginator();
        var pageIndex = paginator.PageIndex < 1 ? 1 : paginator.PageIndex;
        var pageSize = paginator.PageSize < 1 ? 10 : paginator.PageSize;

        // Apply sorting
        query = ApplySorting(query, paginator.SortBy, paginator.IsDescending);

        var items = await query
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new Response.ProductDetailResponse
            {
                Id = p.Id,
                SKU = p.SKU,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                OriginalPrice = p.OriginalPrice,
                StockQuantity = p.StockQuantity,
                ImageUrl = p.ImageUrl,
                Category = p.Category,
                CategoryId = p.CategoryId,
                Status = p.Status,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                AverageRating = p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : null,
                ReviewCount = p.Reviews.Count
            })
            .ToListAsync();

        var result = new Response.ProductListResponse
        {
            Items = items,
            PageIndex = pageIndex,
            PageSize = pageSize,
            TotalCount = totalCount
        };

        await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(5));

        return result;
    }

    public async Task<Response.ProductDetailResponse> GetProductById(Guid id)
    {
        var cacheKey = $"{CachePrefix}detail_{id}";

        var cachedResult = await _cacheService.GetAsync<Response.ProductDetailResponse>(cacheKey);
        if (cachedResult != null)
        {
            return cachedResult;
        }

        var product = await _dbContext.Products.Include(x => x.Reviews).FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (product == null)
        {
            throw new NotFoundException($"Không tìm thấy sản phẩm với ID '{id}'");
        }

        var response = new Response.ProductDetailResponse
        {
            Id = product.Id,
            SKU = product.SKU,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            OriginalPrice = product.OriginalPrice,
            StockQuantity = product.StockQuantity,
            ImageUrl = product.ImageUrl,
            Category = product.Category,
            CategoryId = product.CategoryId,
            Status = product.Status,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt,
            AverageRating = product.Reviews != null && product.Reviews.Any() ? product.Reviews.Average(r => r.Rating) : null,
            ReviewCount = product.Reviews != null ? product.Reviews.Count : 0
        };

        await _cacheService.SetAsync(cacheKey, response, TimeSpan.FromMinutes(10));

        return response;
    }

    public async Task<Response.ProductCommandResponse> CreateProduct(Request.CreateProductRequest request)
    {
        // Check duplicate SKU
        var existingSku = await _dbContext.Products.FirstOrDefaultAsync(
            x => x.SKU.ToLower() == request.SKU.ToLower() && !x.IsDeleted);

        if (existingSku != null)
        {
            throw new BadRequestException($"Mã SKU '{request.SKU}' đã tồn tại");
        }

        var category = await ResolveActiveCategoryAsync(request.CategoryId, request.Category);

        var product = new ProductEntity
        {
            Id = Guid.NewGuid(),
            SKU = request.SKU,
            Name = request.Name,
            Description = request.Description ?? string.Empty,
            Price = request.Price,
            OriginalPrice = request.OriginalPrice,
            StockQuantity = request.StockQuantity,
            ImageUrl = request.ImageUrl,
            Status = request.StockQuantity > 0 ? "Active" : "OutOfStock",
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        product.Category = category.Name;
        product.CategoryId = category.Id;

        await _dbContext.Products.AddAsync(product);
        await _dbContext.SaveChangesAsync();

        await InvalidateCacheAsync(product.Id);

        return new Response.ProductCommandResponse
        {
            Id = product.Id,
            Success = true,
            Message = "Tạo sản phẩm thành công"
        };
    }

    public async Task<Response.ProductCommandResponse> UpdateProduct(Guid id, Request.UpdateProductRequest request)
    {
        var product = await _dbContext.Products.Include(x => x.Reviews).FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (product == null)
        {
            throw new NotFoundException($"Không tìm thấy sản phẩm với ID '{id}'");
        }

        var category = await ResolveActiveCategoryAsync(request.CategoryId, request.Category);

        product.Name = request.Name;
        product.Description = request.Description ?? string.Empty;
        product.Price = request.Price;
        product.OriginalPrice = request.OriginalPrice;
        product.StockQuantity = request.StockQuantity;
        product.ImageUrl = request.ImageUrl;
        product.Status = request.Status;

        product.Category = category.Name;
        product.CategoryId = category.Id;

        product.UpdatedAt = DateTime.UtcNow;

        _dbContext.Products.Update(product);
        await _dbContext.SaveChangesAsync();

        await InvalidateCacheAsync(id);

        return new Response.ProductCommandResponse
        {
            Id = id,
            Success = true,
            Message = "Cập nhật sản phẩm thành công"
        };
    }

    public async Task<BaseResponse> DeleteProduct(Guid id)
    {
        var product = await _dbContext.Products.Include(x => x.Reviews).FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (product == null)
        {
            throw new NotFoundException($"Không tìm thấy sản phẩm với ID '{id}'");
        }

        product.IsDeleted = true;
        product.UpdatedAt = DateTime.UtcNow;
        _dbContext.Products.Update(product);
        var result = await _dbContext.SaveChangesAsync() > 0;

        if (result)
        {
            await InvalidateCacheAsync(id);
        }

        return new BaseResponse
        {
            Success = result,
            Message = result ? "Xóa sản phẩm thành công" : "Không thể xóa sản phẩm"
        };
    }

    public async Task<Response.ProductStatisticsResponse> GetStatistics()
    {
        var cacheKey = $"{CachePrefix}statistics";

        var cachedResult = await _cacheService.GetAsync<Response.ProductStatisticsResponse>(cacheKey);
        if (cachedResult != null)
        {
            return cachedResult;
        }

        var query = _dbContext.Products.Where(x => !x.IsDeleted).AsNoTracking();

        var stats = new Response.ProductStatisticsResponse
        {
            TotalProducts = await query.CountAsync(),
            ActiveProducts = await query.CountAsync(x => x.Status == "Active"),
            InactiveProducts = await query.CountAsync(x => x.Status == "Inactive"),
            OutOfStockProducts = await query.CountAsync(x => x.Status == "OutOfStock"),
            MaxPrice = await query.AnyAsync() ? await query.MaxAsync(x => x.Price) : 0,
            MinPrice = await query.AnyAsync() ? await query.MinAsync(x => x.Price) : 0,
            AveragePrice = await query.AnyAsync() ? await query.AverageAsync(x => x.Price) : 0
        };

        await _cacheService.SetAsync(cacheKey, stats, TimeSpan.FromMinutes(5));

        return stats;
    }

    #region Private Methods

    private async Task<MySystem.Repository.Entities.Category> ResolveActiveCategoryAsync(Guid? categoryId, string? categoryName)
    {
        var query = _dbContext.Categories.Where(x => !x.IsDeleted && x.IsActive);
        var category = categoryId.HasValue
            ? await query.FirstOrDefaultAsync(x => x.Id == categoryId.Value)
            : await query.FirstOrDefaultAsync(x => x.Name.ToLower() == (categoryName ?? string.Empty).Trim().ToLower());

        if (category is null)
            throw new BadRequestException("A valid active category is required");

        return category;
    }
    private async Task InvalidateCacheAsync(Guid id)
    {
        await _cacheService.RemoveAsync($"{CachePrefix}detail_{id}");
        await _cacheService.RemoveByPrefixAsync($"{CachePrefix}list_");
        await _cacheService.RemoveAsync($"{CachePrefix}statistics");
    }

    private static IQueryable<ProductEntity> ApplySorting(
        IQueryable<ProductEntity> query,
        string? sortBy,
        bool isDescending)
    {
        return sortBy?.ToLower() switch
        {
            "name" => isDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
            "price" => isDescending ? query.OrderByDescending(x => x.Price) : query.OrderBy(x => x.Price),
            "stock" => isDescending ? query.OrderByDescending(x => x.StockQuantity) : query.OrderBy(x => x.StockQuantity),
            "createdat" => isDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt),
            "updatedat" => isDescending ? query.OrderByDescending(x => x.UpdatedAt) : query.OrderBy(x => x.UpdatedAt),
            "rating" => isDescending ? query.OrderByDescending(x => x.Reviews.Any() ? x.Reviews.Average(r => r.Rating) : 0) : query.OrderBy(x => x.Reviews.Any() ? x.Reviews.Average(r => r.Rating) : 0),
            _ => query.OrderByDescending(x => x.CreatedAt)
        };
    }

    private static string BuildFilterCacheKey(Request.ProductFilters? filters)
    {
        if (filters == null) return "null";

        var parts = new List<string>();
        if (filters.Ids != null) parts.Add($"ids={string.Join(",", filters.Ids)}");
        if (!string.IsNullOrWhiteSpace(filters.Search)) parts.Add($"s={filters.Search}");
        if (!string.IsNullOrWhiteSpace(filters.Category)) parts.Add($"c={filters.Category}");
        if (filters.CategoryId.HasValue) parts.Add($"cid={filters.CategoryId}");
        if (filters.PriceFrom.HasValue) parts.Add($"pf={filters.PriceFrom}");
        if (filters.PriceTo.HasValue) parts.Add($"pt={filters.PriceTo}");
        if (filters.Status != null) parts.Add($"st={string.Join(",", filters.Status)}");

        return parts.Any() ? string.Join("_", parts) : "empty";
    }

    private static string BuildPageCacheKey(Request.ProductPaginator? paginator)
    {
        if (paginator == null) return "p=1_10";
        return $"p={paginator.PageIndex}_{paginator.PageSize}_s={paginator.SortBy ?? "none"}_{paginator.IsDescending}";
    }

    #endregion
}
