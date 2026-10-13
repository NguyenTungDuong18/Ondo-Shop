import type { ApiResponse } from '../models/api';
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '../models/order';

export interface CategoryRepository {
  getCategories(activeOnly?: boolean): Promise<ApiResponse<CategoryResponse[]>>;
  getCategoryById(id: string): Promise<ApiResponse<CategoryResponse>>;
  createCategory(data: CreateCategoryRequest): Promise<ApiResponse<CategoryResponse>>;
  updateCategory(id: string, data: UpdateCategoryRequest): Promise<ApiResponse<CategoryResponse>>;
  deleteCategory(id: string): Promise<ApiResponse<null>>;
}
