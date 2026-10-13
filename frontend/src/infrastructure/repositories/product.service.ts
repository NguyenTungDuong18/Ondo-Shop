import type { ApiResponse, PagedResult } from '../../domain/models/api';
import type { CreateProductRequest, ProductCommandResponse, ProductFilterQuery, ProductResponse, UpdateProductRequest } from '../../domain/models/product';
import type { ProductRepository, ProductStatisticsResponse } from '../../domain/repositories/ProductRepository';

import axiosClient from '../http/axiosClient';

function buildQueryParams(params?: ProductFilterQuery): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {};
  if (params?.search) query['Filters.Search'] = params.search;
  if (params?.category) query['Filters.Category'] = params.category;
  if (params?.categoryId) query['Filters.CategoryId'] = params.categoryId;
  if (params?.minPrice !== undefined) query['Filters.PriceFrom'] = params.minPrice;
  if (params?.maxPrice !== undefined) query['Filters.PriceTo'] = params.maxPrice;
  if (params?.pageIndex) query['Paginator.PageIndex'] = params.pageIndex;
  if (params?.pageSize) query['Paginator.PageSize'] = params.pageSize;
  if (params?.sortBy) query['Paginator.SortBy'] = params.sortBy;
  if (params?.sortOrder) query['Paginator.IsDescending'] = params.sortOrder === 'desc';
  return query;
}

export const productRepository: ProductRepository = {
  async getProducts(params?: ProductFilterQuery): Promise<ApiResponse<PagedResult<ProductResponse>>> {
    const response = await axiosClient.get<ApiResponse<PagedResult<ProductResponse>>>('/api/v1/product', {
      params: buildQueryParams(params),
    });
    return response.data;
  },

  async getProductById(id: string): Promise<ApiResponse<ProductResponse>> {
    const response = await axiosClient.get<ApiResponse<ProductResponse>>(`/api/v1/product/${id}`);
    return response.data;
  },

  async createProduct(data: CreateProductRequest): Promise<ApiResponse<ProductCommandResponse>> {
    const response = await axiosClient.post<ApiResponse<ProductCommandResponse>>('/api/v1/product', data);
    return response.data;
  },

  async updateProduct(id: string, data: UpdateProductRequest): Promise<ApiResponse<ProductCommandResponse>> {
    const response = await axiosClient.put<ApiResponse<ProductCommandResponse>>(`/api/v1/product/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    const response = await axiosClient.delete<ApiResponse<null>>(`/api/v1/product/${id}`);
    return response.data;
  },

  async getStatistics(): Promise<ApiResponse<ProductStatisticsResponse>> {
    const response = await axiosClient.get<ApiResponse<ProductStatisticsResponse>>('/api/v1/product/statistics');
    return response.data;
  },
};

