import type { useOrderDetailPage } from '../hooks/useOrderDetailPage';
type Props = {
  order: NonNullable<NonNullable<ReturnType<typeof useOrderDetailPage>>['order']>;
  StatusIcon: React.ElementType;
  cfg: { label: string; icon: React.ElementType; };
};
export function OrderHeader({ order, StatusIcon, cfg }: Props) {
  return (<div
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
  </div>);
}
