import type { useOrderDetailPage } from '../hooks/useOrderDetailPage';
type Props = {
  formatVND: NonNullable<ReturnType<typeof useOrderDetailPage>>['formatVND'];
  order: NonNullable<NonNullable<ReturnType<typeof useOrderDetailPage>>['order']>;
};
export function OrderTotals({ formatVND, order }: Props) {
  return (<div className="onda-modal rounded-2xl p-5 space-y-2">
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
  </div>);
}
