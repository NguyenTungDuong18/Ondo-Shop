import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyOrdersQuery } from '../hooks/useCartQueries';
import { Spinner } from '../components/common/Loader';
import { Button } from '../components/common/Button';
import { LinkButton } from '../components/common/LinkButton';
import { Package, ChevronRight, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react';
import type { OrderStatus } from '../types/order';

const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType }> = {
  Pending:     { label: 'Chờ xác nhận', icon: Clock },
  Confirmed:   { label: 'Đã xác nhận', icon: CheckCircle2 },
  Processing:  { label: 'Đang xử lý', icon: Package },
  Shipped:     { label: 'Đang giao', icon: Truck },
  Delivered:   { label: 'Đã giao', icon: CheckCircle2 },
  Cancelled:   { label: 'Đã hủy', icon: XCircle },
};

export const MyOrdersPage: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;

  const { data: response, isLoading } = useMyOrdersQuery({ pageIndex, pageSize });
  const orders = response?.data?.items || [];
  const totalPages = response?.data?.totalPages || 1;

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <h1 className="nike-title text-2xl" style={{ color: 'var(--text-primary)' }}>MY ORDERS</h1>
        <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>Track and manage your purchases</p>
      </div>

      {isLoading ? (
        <Spinner label="Loading your orders..." />
      ) : orders.length === 0 ? (
        <div
          className="onda-modal rounded-3xl p-12 text-center space-y-4"
        >
          <Package className="w-12 h-12 mx-auto" style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
          <h2 className="nike-title text-lg" style={{ color: 'var(--text-primary)' }}>NO ORDERS YET</h2>
          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Start shopping to place your first order.</p>
          <LinkButton to="/shop" variant="primary" size="sm">
            Browse Shop
          </LinkButton>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const cfg = statusConfig[order.status] || statusConfig.Pending;
            const StatusIcon = cfg.icon;
            const itemCount = order.items?.length || order.itemCount || 0;

            return (
              <Link
                key={order.id}
                to={`/order/${order.id}`}
                className="onda-card rounded-2xl p-5 flex items-center gap-4 cursor-pointer"
              >
                {/* Status Icon */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--surface-raised)' }}
                >
                  <StatusIcon className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                </div>

                {/* Order Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="nike-title text-sm" style={{ color: 'var(--text-primary)' }}>{order.orderNumber}</span>
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-secondary)' }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {itemCount} item{itemCount > 1 ? 's' : ''} · {formatVND(order.totalAmount)}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
              </Link>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={pageIndex === i + 1 ? 'primary' : 'outline'}
                  size="xs"
                  onClick={() => setPageIndex(i + 1)}
                  className="w-9 h-9 rounded-full !px-0"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
