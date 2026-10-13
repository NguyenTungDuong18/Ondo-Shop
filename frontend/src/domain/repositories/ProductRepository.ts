import type { ApiResponse, PagedResult } from '../models/api';
import type { CreateProductRequest, ProductCommandResponse, ProductFilterQuery, ProductResponse, UpdateProductRequest } from '../models/product';
export interface ProductStatisticsResponse {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  outOfStockProducts: number;
  maxPrice: number;
  minPrice: number;
  averagePrice: number;
}
export interface ProductRepository {
  getProducts(params?: ProductFilterQuery): Promise<ApiResponse<PagedResult<ProductResponse>>>;
  getProductById(id: string): Promise<ApiResponse<ProductResponse>>;
  createProduct(data: CreateProductRequest): Promise<ApiResponse<ProductCommandResponse>>;
  updateProduct(id: string, data: UpdateProductRequest): Promise<ApiResponse<ProductCommandResponse>>;
  deleteProduct(id: string): Promise<ApiResponse<null>>;
  getStatistics(): Promise<ApiResponse<ProductStatisticsResponse>>;
}
