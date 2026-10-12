using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MySystem.Repository;
using OrderEntity = MySystem.Repository.Entities.Order;
using OrderItemEntity = MySystem.Repository.Entities.OrderItem;
using ProductEntity = MySystem.Repository.Entities.Product;
using UserEntity = MySystem.Repository.Entities.User;
using MySystem.Repository.Entities;
using MySystem.Service.Exceptions;

namespace MySystem.Service.Order;

public class Service : IService
{
    private readonly AppDbContext _dbContext;

    private const decimal FREE_SHIPPING_THRESHOLD = 500000m;
    private const decimal SHIPPING_FEE = 30000m;

    public Service(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Response.OrderListResponse> GetOrders(Request.OrderListRequest? request = null)
    {
        request ??= new Request.OrderListRequest();

        var query = _dbContext.Orders.Where(x => !x.IsDeleted)
            .Include(x => x.User)
            .Include(x => x.OrderItems)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();
            query = query.Where(x =>
                x.OrderNumber.ToLower().Contains(search) ||
                x.ShippingName.ToLower().Contains(search) ||
                x.ShippingPhone.Contains(search));
        }

        if (request.Status.HasValue)
            query = query.Where(x => x.Status == request.Status.Value);

        var pageIndex = Math.Max(1, request.PageIndex);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var totalCount = await query.CountAsync();
        var orders = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return MapToListResponse(orders, pageIndex, pageSize, totalCount);
    }

    public async Task<Response.OrderResponse> GetOrderById(Guid id)
    {
        var order = await _dbContext.Orders.Where(x => !x.IsDeleted)
            .Include(x => x.User)
            .Include(x => x.OrderItems)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (order == null)
            throw new NotFoundException("Đơn hàng không tìm thấy");

        return MapToResponse(order);
    }

    public async Task<Response.OrderListResponse> GetMyOrders(Guid userId, Request.OrderListRequest? request = null)
    {
        request ??= new Request.OrderListRequest();

        var query = _dbContext.Orders.Where(x => !x.IsDeleted)
            .Include(x => x.User)
            .Include(x => x.OrderItems)
            .Where(x => x.UserId == userId);

        if (request.Status.HasValue)
            query = query.Where(x => x.Status == request.Status.Value);

        var pageIndex = Math.Max(1, request.PageIndex);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var totalCount = await query.CountAsync();
        var orders = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return MapToListResponse(orders, pageIndex, pageSize, totalCount);
    }

    public async Task<Response.OrderResponse> CreateOrder(Guid userId, Request.CreateOrderRequest request)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId && !x.IsDeleted);
        if (user == null)
            throw new NotFoundException("Người dùng không tìm thấy");

        if (request.Items == null || request.Items.Count == 0)
            throw new BadRequestException("Đơn hàng phải có ít nhất 1 sản phẩm");

        // Validate products & snapshot prices
        var productIds = request.Items.Select(x => x.ProductId).ToList();
        var products = await _dbContext.Products.Where(p => !p.IsDeleted)
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync();

        var missingIds = productIds.Except(products.Select(p => p.Id)).ToList();
        if (missingIds.Any())
            throw new BadRequestException($"Sản phẩm không tìm thấy: {string.Join(", ", missingIds)}");

        var orderNumber = GenerateOrderNumber();
        decimal subtotal = 0;

        var order = new OrderEntity
        {
            Id = Guid.NewGuid(),
            OrderNumber = orderNumber,
            UserId = userId,
            Status = OrderStatus.Pending,
            StatusDescription = "Chờ xác nhận",
            ShippingName = request.ShippingName,
            ShippingPhone = request.ShippingPhone,
            ShippingAddress = request.ShippingAddress,
            ShippingNote = request.ShippingNote,
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.Orders.AddAsync(order);

        var orderItems = new List<OrderItemEntity>();

        foreach (var itemReq in request.Items)
        {
            var product = products.First(p => p.Id == itemReq.ProductId);

            if (product.Status != "Active")
                throw new BadRequestException($"Sản phẩm '{product.Name}' không còn active");

            if (product.StockQuantity < itemReq.Quantity)
                throw new BadRequestException($"Sản phẩm '{product.Name}' không đủ stock (còn {product.StockQuantity})");

            var item = new OrderItemEntity
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                ProductSku = product.SKU,
                ProductImageUrl = product.ImageUrl,
                Quantity = itemReq.Quantity,
                UnitPrice = product.Price,
                DiscountAmount = 0,
                CreatedAt = DateTime.UtcNow
            };

            subtotal += product.Price * itemReq.Quantity;
            orderItems.Add(item);

            // Deduct stock
            product.StockQuantity -= itemReq.Quantity;
            if (product.StockQuantity <= 0)
                product.Status = "OutOfStock";
            product.UpdatedAt = DateTime.UtcNow;
            _dbContext.Products.Update(product);

            await _dbContext.OrderItems.AddAsync(item);
        }

        order.ShippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
        order.TotalAmount = subtotal + order.ShippingFee;

        _dbContext.Orders.Update(order);
        await _dbContext.SaveChangesAsync();

        order.OrderItems = orderItems;
        return MapToResponse(order);
    }

    public async Task<Response.OrderResponse> UpdateOrderStatus(Guid id, Request.UpdateOrderStatusRequest request)
    {
        var order = await _dbContext.Orders.Where(x => !x.IsDeleted)
            .Include(x => x.OrderItems)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (order == null)
            throw new NotFoundException("Đơn hàng không tìm thấy");

        order.Status = request.Status;
        order.StatusDescription = request.StatusDescription ?? GetStatusDescription(request.Status);
        order.UpdatedAt = DateTime.UtcNow;

        switch (request.Status)
        {
            case OrderStatus.Confirmed: order.ConfirmedAt = DateTime.UtcNow; break;
            case OrderStatus.Shipped: order.ShippedAt = DateTime.UtcNow; break;
            case OrderStatus.Delivered: order.DeliveredAt = DateTime.UtcNow; break;
            case OrderStatus.Cancelled: order.CancelledAt = DateTime.UtcNow; break;
        }

        _dbContext.Orders.Update(order);

        // Restore stock if cancelled
        if (request.Status == OrderStatus.Cancelled)
        {
            foreach (var item in order.OrderItems)
            {
                var product = await _dbContext.Products.FirstOrDefaultAsync(p => p.Id == item.ProductId && !p.IsDeleted);
                if (product != null)
                {
                    product.StockQuantity += item.Quantity;
                    if (product.Status == "OutOfStock")
                        product.Status = "Active";
                    product.UpdatedAt = DateTime.UtcNow;
                    _dbContext.Products.Update(product);
                }
            }
        }

        await _dbContext.SaveChangesAsync();

        return MapToResponse(order);
    }

    private static Response.OrderListResponse MapToListResponse(IEnumerable<OrderEntity> orders, int pageIndex, int pageSize, int totalCount) => new()
    {
        Items = orders.Select(MapToResponse).ToList(),
        PageIndex = pageIndex,
        PageSize = pageSize,
        TotalCount = totalCount
    };
    private static Response.OrderResponse MapToResponse(OrderEntity order)
    {
        var items = order.OrderItems?.ToList() ?? new List<OrderItemEntity>();

        return new Response.OrderResponse
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            UserId = order.UserId,
            UserFullName = order.User?.FullName,
            Status = order.Status,
            StatusDescription = order.StatusDescription,
            ShippingName = order.ShippingName,
            ShippingPhone = order.ShippingPhone,
            ShippingAddress = order.ShippingAddress,
            ShippingNote = order.ShippingNote,
            TotalAmount = order.TotalAmount,
            ShippingFee = order.ShippingFee,
            DiscountAmount = order.DiscountAmount,
            ItemCount = items.Sum(x => x.Quantity),
            ConfirmedAt = order.ConfirmedAt,
            ShippedAt = order.ShippedAt,
            DeliveredAt = order.DeliveredAt,
            CancelledAt = order.CancelledAt,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,
            Items = items.Select(x => new Response.OrderItemResponse
            {
                Id = x.Id,
                OrderId = x.OrderId,
                ProductId = x.ProductId,
                ProductName = x.ProductName,
                ProductSku = x.ProductSku,
                ProductImageUrl = x.ProductImageUrl,
                Quantity = x.Quantity,
                UnitPrice = x.UnitPrice,
                DiscountAmount = x.DiscountAmount,
                Subtotal = (x.UnitPrice - x.DiscountAmount) * x.Quantity,
                CreatedAt = x.CreatedAt
            }).ToList()
        };
    }

    private static string GenerateOrderNumber()
    {
        var date = DateTime.UtcNow.ToString("yyyyMMdd");
        var rand = Random.Shared.Next(1000, 9999);
        return $"ORD-{date}-{rand}";
    }

    private static string GetStatusDescription(OrderStatus status) => status switch
    {
        OrderStatus.Pending => "Chờ xác nhận",
        OrderStatus.Confirmed => "Đã xác nhận",
        OrderStatus.Processing => "Đang xử lý",
        OrderStatus.Shipped => "Đang giao hàng",
        OrderStatus.Delivered => "Đã giao hàng",
        OrderStatus.Cancelled => "Đã hủy",
        _ => ""
    };
}
