import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/order.service';
import type { CreateOrderRequest, OrderFilterQuery, UpdateOrderStatusRequest } from '../types/order';
import { useUIStore } from '../store/uiStore';

export const ORDER_QUERY_KEYS = {
  all: ['orders'] as const,
  list: (params?: OrderFilterQuery) => ['orders', 'list', params] as const,
  detail: (id?: string) => ['orders', 'detail', id] as const,
};

export const useOrdersQuery = (params?: OrderFilterQuery) => {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.list(params),
    queryFn: () => orderService.getOrders(params),
  });
};

export const useOrderDetailQuery = (id?: string) => {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.detail(id),
    queryFn: () => orderService.getOrderById(id!),
    enabled: !!id,
  });
};

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => orderService.createOrder(data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });
        addToast('success', res.message || 'Äáº·t hÃ ng thÃ nh cÃ´ng!');
      }
    },
    onError: (error: Error) => {
      addToast('error', error.message || 'Äáº·t hÃ ng tháº¥t báº¡i.');
    },
  });
};

export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusRequest }) =>
      orderService.updateOrderStatus(id, data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });
        addToast('success', res.message || 'Cáº­p nháº­t Ä‘Æ¡n hÃ ng thÃ nh cÃ´ng!');
      }
    },
    onError: (error: Error) => {
      addToast('error', error.message || 'Cáº­p nháº­t tháº¥t báº¡i.');
    },
  });
};

export const useMyOrdersQuery = (params?: OrderFilterQuery) => {
  return useQuery({
    queryKey: ['orders', 'my-orders', params],
    queryFn: () => orderService.getMyOrders(params),
  });
};
