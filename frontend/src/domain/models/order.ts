export interface ProductImageResponse {
  id: string;
  productId: string;
  imageUrl: string;
  altText?: string | null;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface ProductReviewResponse {
  id: string;
  productId: string;
  userId: string;
  userFullName?: string;
  userAvatarUrl?: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

// === Category ===
export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

// === Order ===
export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface OrderResponse {
  id: string;
  orderNumber: string;
  userId: string;
  userFullName?: string;
  status: OrderStatus;
  statusDescription: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingNote?: string | null;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  items?: OrderItemResponse[];
  itemCount?: number;
  confirmedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface OrderItemResponse {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSku: string;
  productImageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  subtotal: number;
  createdAt: string;
}

export interface CreateOrderRequest {
  items: CreateOrderItemRequest[];
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingNote?: string;
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  statusDescription?: string;
}

export interface OrderFilterQuery {
  search?: string;
  status?: OrderStatus;
  pageIndex?: number;
  pageSize?: number;
}

// === Cart (client-side only) ===
export interface CartItem {
  productId: string;
  productName: string;
  productSku: string;
  productImageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  stockQuantity: number;
}
