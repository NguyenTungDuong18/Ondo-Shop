import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/category.service';
import type { CreateCategoryRequest, UpdateCategoryRequest } from '../types/order';
import { useUIStore } from '../store/uiStore';

export const CATEGORY_QUERY_KEYS = {
  all: ['categories'] as const,
  list: (activeOnly?: boolean) => ['categories', 'list', activeOnly] as const,
};

export const useCategoriesQuery = (activeOnly = false) => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.list(activeOnly),
    queryFn: () => categoryService.getCategories(activeOnly),
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryService.createCategory(data),
    onSuccess: (res) => {
      if (res.success) {
        addToast('success', res.message || 'Tạo danh mục thành công!');
        queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
      }
    },
    onError: (error: Error) => {
      addToast('error', error.message || 'Tạo danh mục thất bại.');
    },
  });
};

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      categoryService.updateCategory(id, data),
    onSuccess: (res) => {
      if (res.success) {
        addToast('success', res.message || 'Cập nhật danh mục thành công!');
        queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
      }
    },
    onError: (error: Error) => {
      addToast('error', error.message || 'Cập nhật thất bại.');
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: (res) => {
      if (res.success) {
        addToast('success', res.message || 'Xóa danh mục thành công!');
        queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
      }
    },
    onError: (error: Error) => {
      addToast('error', error.message || 'Xóa thất bại.');
    },
  });
};
