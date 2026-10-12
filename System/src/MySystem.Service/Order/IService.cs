using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MySystem.Service.Order;

public interface IService
{
    Task<Response.OrderListResponse> GetOrders(Request.OrderListRequest? request = null);
    Task<Response.OrderResponse> GetOrderById(Guid id);
    Task<Response.OrderListResponse> GetMyOrders(Guid userId, Request.OrderListRequest? request = null);
    Task<Response.OrderResponse> CreateOrder(Guid userId, Request.CreateOrderRequest request);
    Task<Response.OrderResponse> UpdateOrderStatus(Guid id, Request.UpdateOrderStatusRequest request);
}
