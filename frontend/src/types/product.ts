export interface ProductResponse {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  stockQuantity: number;
  imageUrl?: string | null;
  category: string;
  categoryId?: string | null;
  status: string;
  // Computed/virtual fields from joins
  averageRating?: number;
  reviewCount?: number;
  // Navigation
  images?: Array<{
    id: string; productId: string; imageUrl: string;
    altText?: string | null; displayOrder: number; isPrimary: boolean; createdAt: string;
  }>;
  reviews?: Array<{
    id: string; productId: string; userId: string; rating: number;
    title?: string | null; comment?: string | null;
    isVerifiedPurchase: boolean; isApproved: boolean; createdAt: string;
  }>;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ProductCommandResponse {
  id: string;
  message: string;
  success: boolean;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  imageUrl?: string;
  category: string;
  categoryId?: string;
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  imageUrl?: string;
  category: string;
  categoryId?: string;
  status: string;
}

export interface ProductFilterQuery {
  search?: string;
  category?: string;
  categoryId?: string;
  pageIndex?: number;
  pageSize?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'name' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

// Re-export shared types
export type { CartItem } from './order';
