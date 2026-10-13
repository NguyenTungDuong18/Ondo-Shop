import type { ApiResponse, PagedResult } from '../models/api';
import type { CreateOrderRequest, OrderFilterQuery, OrderResponse, UpdateOrderStatusRequest } from '../models/order';

export interface OrderRepository {
  getOrders(params?: OrderFilterQuery): Promise<ApiResponse<PagedResult<OrderResponse>>>;
  getOrderById(id: string): Promise<ApiResponse<OrderResponse>>;
  getMyOrders(params?: OrderFilterQuery): Promise<ApiResponse<PagedResult<OrderResponse>>>;
  createOrder(data: CreateOrderRequest): Promise<ApiResponse<OrderResponse>>;
  updateOrderStatus(id: string, data: UpdateOrderStatusRequest): Promise<ApiResponse<OrderResponse>>;
}
