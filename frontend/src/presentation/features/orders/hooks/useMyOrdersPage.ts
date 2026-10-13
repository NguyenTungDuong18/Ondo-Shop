import { useState } from 'react';
import { pagination } from '../../../../shared/config/commerce';
import { formatVND as formatCurrency } from '../../../../shared/format/currency';
import { useMyOrdersQuery } from '../../../hooks/useOrderQueries';
export function useMyOrdersPage() {

  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = pagination.orders;

  const { data: response, isLoading } = useMyOrdersQuery({ pageIndex, pageSize });
  const orders = response?.data?.items || [];
  const totalPages = response?.data?.totalPages || 1;

  const formatVND = formatCurrency;
  return { pageIndex, setPageIndex, isLoading, orders, totalPages, formatVND };
}
