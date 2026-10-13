import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { Spinner } from '../../../shared/components/Loader';
import { statusConfig } from '../config/orderStatus';
import type { useOrderDetailPage } from '../hooks/useOrderDetailPage';
import { OrderHeader } from './OrderHeader';
import { OrderItems } from './OrderItems';
import { OrderShippingDetails } from './OrderShippingDetails';
import { OrderTotals } from './OrderTotals';
export function OrderDetailView({ model }: { model: ReturnType<typeof useOrderDetailPage> }) {
  if (!model) return null;
  const { navigate, isLoading, isError, order, formatVND } = model;

  if (isLoading) return <Spinner label="Loading order details..." />;

  if (isError || !order) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-4 py-12">
        <Package className="w-12 h-12 mx-auto" style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
        <h2 className="nike-title text-xl" style={{ color: 'var(--text-primary)' }}>ORDER NOT FOUND</h2>
        <Button variant="outline" size="sm" onClick={() => navigate('/my-orders')} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to My Orders
        </Button>
      </div>
    );
  }

  const cfg = statusConfig[order.status] || statusConfig.Pending;
  const StatusIcon = cfg.icon;

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in pb-16">
      <Button variant="outline" size="sm" onClick={() => navigate('/my-orders')} icon={<ArrowLeft className="w-4 h-4" />}>
        Back
      </Button>

      {/* Header */}
      <OrderHeader order={order} StatusIcon={StatusIcon} cfg={cfg} />

      {/* Shipping Info */}
      <OrderShippingDetails order={order} />

      {/* Items */}
      <OrderItems order={order} formatVND={formatVND} />

      {/* Totals */}
      <OrderTotals formatVND={formatVND} order={order} />
    </div>
  );

}
