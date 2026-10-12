import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderDetailQuery } from '../hooks/useCartQueries';
import { Spinner } from '../components/common/Loader';
import { Button } from '../components/common/Button';
import { ArrowLeft, Package, MapPin, Phone, User, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';
import type { OrderStatus } from '../types/order';

const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType }> = {
  Pending:     { label: 'Chá» xÃ¡c nháº­n', icon: Clock },
  Confirmed:   { label: 'ÄÃ£ xÃ¡c nháº­n', icon: CheckCircle2 },
  Processing:  { label: 'Äang xá»­ lÃ½', icon: Package },
  Shipped:     { label: 'Äang giao', icon: Truck },
  Delivered:   { label: 'ÄÃ£ giao', icon: CheckCircle2 },
  Cancelled:   { label: 'ÄÃ£ há»§y', icon: XCircle },
};

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: response, isLoading, isError } = useOrderDetailQuery(id);
  const order = response?.data;

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

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
      <div
        className="rounded-2xl p-6 flex items-center justify-between"
        style={{
          backgroundColor: 'var(--text-primary)',
          color: 'var(--text-inverse)',
        }}
      >
        <div>
          <p className="nike-title text-xs mb-1" style={{ color: 'var(--text-muted)' }}>ORDER NUMBER</p>
          <h1 className="nike-title text-2xl" style={{ color: 'var(--text-inverse)' }}>{order.orderNumber}</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Placed on {new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full border"
          style={{
            backgroundColor: 'var(--surface-overlay)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-primary)',
          }}
        >
          <StatusIcon className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-wider">{cfg.label}</span>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="onda-modal rounded-2xl p-5 space-y-3">
        <h2 className="nike-title text-sm pb-2" style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
          SHIPPING INFORMATION
        </h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{order.shippingName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
            <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{order.shippingPhone}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
            <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{order.shippingAddress}</span>
          </div>
          {order.shippingNote && (
            <div className="flex items-start gap-2 text-sm">
              <Clock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
              <span className="font-medium italic" style={{ color: 'var(--text-muted)' }}>"{order.shippingNote}"</span>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="onda-modal rounded-2xl p-5 space-y-3">
        <h2 className="nike-title text-sm pb-2" style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
          ORDER ITEMS
        </h2>
        <div className="space-y-3">
          {(order.items || []).map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3" style={{ borderBottom: '1px solid var(--border-default)' }}>
              <div
                className="w-16 h-16 rounded-xl overflow-hidden shrink-0"
                style={{ backgroundColor: 'var(--surface-raised)' }}
              >
                <img
                  src={item.productImageUrl ?? undefined}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{item.productName}</p>
                <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{item.productSku}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Qty: {item.quantity} Ã— {formatVND(item.unitPrice)}</span>
                </div>
              </div>
              <span className="text-sm font-black shrink-0" style={{ color: 'var(--text-primary)' }}>
                {formatVND(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="onda-modal rounded-2xl p-5 space-y-2">
        <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span>Subtotal</span>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatVND(order.totalAmount - order.shippingFee + order.discountAmount)}</span>
        </div>
        <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span>Shipping</span>
          <span className="font-semibold">
            {order.shippingFee === 0 ? <span style={{ color: 'var(--text-success)' }}>FREE</span> : formatVND(order.shippingFee)}
          </span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-sm" style={{ color: 'var(--text-success)' }}>
            <span>Discount</span>
            <span className="font-semibold">-{formatVND(order.discountAmount)}</span>
          </div>
        )}
        <div
          className="flex justify-between text-base font-black pt-2"
          style={{ borderTop: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        >
          <span>Total</span>
          <span>{formatVND(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};
