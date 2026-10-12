import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import type { CreateProductRequest, ProductFilterQuery, UpdateProductRequest } from '../types/product';
import { useUIStore } from '../store/uiStore';

export const PRODUCT_QUERY_KEYS = {
  all: ['products'] as const,
  list: (params?: ProductFilterQuery) => ['products', 'list', params] as const,
  detail: (id?: string) => ['products', 'detail', id] as const,
};

export const useProductsQuery = (params?: ProductFilterQuery) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.list(params),
    queryFn: () => productService.getProducts(params),
  });
};

export const useProductDetailQuery = (id?: string) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.detail(id),
    queryFn: () => productService.getProductById(id!),
    enabled: !!id,
  });
};

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productService.createProduct(data),
    onSuccess: (res) => {
      if (res.success) {
        addToast('success', res.message || 'Tạo sản phẩm thành công!');
        queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
      }
    },
    onError: (error: Error) => {
      addToast('error', error.message || 'Tạo sản phẩm thất bại.');
    },
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      productService.updateProduct(id, data),
    onSuccess: (res) => {
      if (res.success) {
        addToast('success', res.message || 'Cập nhật sản phẩm thành công!');
        queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
      }
    },
    onError: (error: Error) => {
      addToast('error', error.message || 'Cập nhật sản phẩm thất bại.');
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: (res) => {
      if (res.success) {
        addToast('success', res.message || 'Xóa sản phẩm thành công!');
        queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
      }
    },
    onError: (error: Error) => {
      addToast('error', error.message || 'Xóa sản phẩm thất bại.');
    },
  });
};
