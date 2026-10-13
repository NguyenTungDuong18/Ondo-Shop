import { Clock, MapPin, Phone, User } from 'lucide-react';
import type { useOrderDetailPage } from '../hooks/useOrderDetailPage';
type Props = {
  order: NonNullable<NonNullable<ReturnType<typeof useOrderDetailPage>>['order']>;
};
export function OrderShippingDetails({ order }: Props) {
  return (<div className="onda-modal rounded-2xl p-5 space-y-3">
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
  </div>);
}
