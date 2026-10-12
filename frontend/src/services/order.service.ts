import axiosClient from '../api/axiosClient';
import type { ApiResponse, PagedResult } from '../types/api';
import type { CreateOrderRequest, OrderFilterQuery, OrderResponse, UpdateOrderStatusRequest } from '../types/order';

export const orderService = {
  async getOrders(params?: OrderFilterQuery): Promise<ApiResponse<PagedResult<OrderResponse>>> {
    const queryParams: Record<string, any> = {};
    if (params?.search) queryParams.Search = params.search;
    if (params?.status) queryParams.Status = params.status;
    if (params?.pageIndex) queryParams.PageIndex = params.pageIndex;
    if (params?.pageSize) queryParams.PageSize = params.pageSize;

    const response = await axiosClient.get<ApiResponse<PagedResult<OrderResponse>>>('/api/v1/order', {
      params: queryParams,
    });
    return response.data;
  },

  async getOrderById(id: string): Promise<ApiResponse<OrderResponse>> {
    const response = await axiosClient.get<ApiResponse<OrderResponse>>(`/api/v1/order/${id}`);
    return response.data;
  },

  async getMyOrders(params?: OrderFilterQuery): Promise<ApiResponse<PagedResult<OrderResponse>>> {
    const queryParams: Record<string, any> = {};
    if (params?.pageIndex) queryParams.PageIndex = params.pageIndex;
    if (params?.pageSize) queryParams.PageSize = params.pageSize;

    const response = await axiosClient.get<ApiResponse<PagedResult<OrderResponse>>>('/api/v1/order/my-orders', {
      params: queryParams,
    });
    return response.data;
  },

  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> {
    const response = await axiosClient.post<ApiResponse<OrderResponse>>('/api/v1/order', data);
    return response.data;
  },

  async updateOrderStatus(id: string, data: UpdateOrderStatusRequest): Promise<ApiResponse<OrderResponse>> {
    const response = await axiosClient.patch<ApiResponse<OrderResponse>>(`/api/v1/order/${id}/status`, data);
    return response.data;
  },
};
