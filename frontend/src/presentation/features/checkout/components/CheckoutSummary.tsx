import { Lock } from 'lucide-react';
import { shippingPolicy } from '../../../../shared/config/commerce';
import { Button } from '../../../shared/components/Button';
import type { useCheckoutPage } from '../hooks/useCheckoutPage';
type Props = {
  items: NonNullable<ReturnType<typeof useCheckoutPage>>['items'];
  formatVND: NonNullable<ReturnType<typeof useCheckoutPage>>['formatVND'];
  totalAmount: NonNullable<ReturnType<typeof useCheckoutPage>>['totalAmount'];
  shippingFee: NonNullable<ReturnType<typeof useCheckoutPage>>['shippingFee'];
  grandTotal: NonNullable<ReturnType<typeof useCheckoutPage>>['grandTotal'];
  createOrder: NonNullable<ReturnType<typeof useCheckoutPage>>['createOrder'];
};
export function CheckoutSummary({ items, formatVND, totalAmount, shippingFee, grandTotal, createOrder }: Props) {
  return (<div className="lg:col-span-2 space-y-4">
    <div className="onda-modal rounded-3xl p-6 space-y-4">
      <h2 className="nike-title text-base border-b pb-3" style={{ borderColor: 'var(--border-default)' }}>ORDER SUMMARY ({items.length} items)</h2>

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: 'var(--surface-raised)' }}>
              <img src={item.productImageUrl ?? undefined} alt={item.productName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{item.productName}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
            </div>
            <span className="text-xs font-black shrink-0">{formatVND(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 space-y-2" style={{ borderColor: 'var(--border-default)' }}>
        {[
          { label: 'Subtotal', value: formatVND(totalAmount()), bold: true },
          { label: 'Shipping', value: shippingFee === 0 ? 'FREE' : formatVND(shippingFee), success: shippingFee === 0 },
          { label: 'Total', value: formatVND(grandTotal), large: true },
        ].map(({ label, value, success, large }) => (
          <div
            key={label}
            className="flex justify-between"
            style={large ? { fontWeight: 'bold', fontSize: '1rem', borderTop: '1px solid var(--border-default)', paddingTop: '0.5rem' } : {}}
          >
            <span className={large ? 'text-base font-black' : 'text-xs'} style={!large && !success ? { color: 'var(--text-secondary)' } : {}}>{label}</span>
            <span className={large ? 'text-base font-black' : 'text-xs font-bold'} style={success ? { color: 'var(--text-success)' } : {}}>{value}</span>
          </div>
        ))}
        {shippingFee > 0 && (
          <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
            Add {formatVND(shippingPolicy.freeShippingThreshold - totalAmount())} more for free shipping
          </p>
        )}
      </div>

      <Button variant="primary" size="lg" type="submit" fullWidth disabled={createOrder.isPending} className="shadow-lg"
        icon={!createOrder.isPending ? <Lock className="w-4 h-4" /> : undefined}>
        {createOrder.isPending ? <span className="animate-pulse">Processing...</span>
          : <span>Place Order Â· {formatVND(grandTotal)}</span>}
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
        <Lock className="w-3 h-3" />
        <span>Secure checkout Â· Your data is protected</span>
      </div>
    </div>
  </div>);
}
