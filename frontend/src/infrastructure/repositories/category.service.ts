import type { ApiResponse } from '../../domain/models/api';
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '../../domain/models/order';
import type { CategoryRepository } from '../../domain/repositories/CategoryRepository';

import axiosClient from '../http/axiosClient';

export const categoryRepository: CategoryRepository = {
  async getCategories(activeOnly = false): Promise<ApiResponse<CategoryResponse[]>> {
    const response = await axiosClient.get<ApiResponse<CategoryResponse[]>>('/api/v1/category', {
      params: { activeOnly },
    });
    return response.data;
  },

  async getCategoryById(id: string): Promise<ApiResponse<CategoryResponse>> {
    const response = await axiosClient.get<ApiResponse<CategoryResponse>>(`/api/v1/category/${id}`);
    return response.data;
  },

  async createCategory(data: CreateCategoryRequest): Promise<ApiResponse<CategoryResponse>> {
    const response = await axiosClient.post<ApiResponse<CategoryResponse>>('/api/v1/category', data);
    return response.data;
  },

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<ApiResponse<CategoryResponse>> {
    const response = await axiosClient.put<ApiResponse<CategoryResponse>>(`/api/v1/category/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: string): Promise<ApiResponse<null>> {
    const response = await axiosClient.delete<ApiResponse<null>>(`/api/v1/category/${id}`);
    return response.data;
  },
};