import type { useOrderDetailPage } from '../hooks/useOrderDetailPage';
type Props = {
  order: NonNullable<NonNullable<ReturnType<typeof useOrderDetailPage>>['order']>;
  formatVND: NonNullable<ReturnType<typeof useOrderDetailPage>>['formatVND'];
};
export function OrderItems({ order, formatVND }: Props) {
  return (<div className="onda-modal rounded-2xl p-5 space-y-3">
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
  </div>);
}
