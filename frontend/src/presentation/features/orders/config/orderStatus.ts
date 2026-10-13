import { CheckCircle2, Clock, Package, Truck, XCircle } from 'lucide-react';
import type React from 'react';
import type { OrderStatus } from '../../../../domain/models/order';
export const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType }> = {
  Pending: { label: 'Chờ xác nhận', icon: Clock },
  Confirmed: { label: 'Đã xác nhận', icon: CheckCircle2 },
  Processing: { label: 'Đang xử lý', icon: Package },
  Shipped: { label: 'Đang giao', icon: Truck },
  Delivered: { label: 'Đã giao', icon: CheckCircle2 },
  Cancelled: { label: 'Đã hủy', icon: XCircle },
};
