using System;
using System.Collections.Generic;
using MySystem.Repository.Entities;

namespace MySystem.Service.Order;

public class Request
{
    public class OrderListRequest
    {
        public string? Search { get; set; }
        public OrderStatus? Status { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class CreateOrderRequest
    {
        public List<CreateOrderItemRequest> Items { get; set; } = new();
        public string ShippingName { get; set; } = string.Empty;
        public string ShippingPhone { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public string? ShippingNote { get; set; }
    }

    public class CreateOrderItemRequest
    {
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class UpdateOrderStatusRequest
    {
        public OrderStatus Status { get; set; }
        public string? StatusDescription { get; set; }
    }
}
