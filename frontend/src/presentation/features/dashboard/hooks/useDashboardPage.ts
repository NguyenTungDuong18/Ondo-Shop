import { formatVND as formatCurrency } from '../../../../shared/format/currency';
import { useProductsQuery } from '../../../hooks/useProductQueries';
import { useAuthStore } from '../../../state/authStore';

export function useDashboardPage() {

  const { user } = useAuthStore();
  const { data: response, isLoading } = useProductsQuery({ pageIndex: 1, pageSize: 50 });

  const products = response?.data?.items || [];
  const totalCount = response?.data?.totalCount || 0;
  const activeProducts = products.filter((p) => p.status === 'Active').length;
  const lowStockProducts = products.filter((p) => p.stockQuantity <= 10).length;
  const totalValue = products.reduce((acc, p) => acc + p.price * p.stockQuantity, 0);

  const formatVND = formatCurrency;
  return { user, isLoading, products, totalCount, activeProducts, lowStockProducts, totalValue, formatVND };
}
