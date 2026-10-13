import { useNavigate, useParams } from 'react-router-dom';
import { formatVND as formatCurrency } from '../../../../shared/format/currency';
import { useOrderDetailQuery } from '../../../hooks/useOrderQueries';
export function useOrderDetailPage() {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: response, isLoading, isError } = useOrderDetailQuery(id);
  const order = response?.data;

  const formatVND = formatCurrency;
  return { id, navigate, isLoading, isError, order, formatVND };
}
