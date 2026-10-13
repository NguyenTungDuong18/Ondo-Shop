import { ArrowRight, X } from 'lucide-react';
import { IconButton } from '../../../shared/components/IconButton';
import { CartItems } from './CartItems';

import type { useCartDrawer } from '../hooks/useCartDrawer';
export function CartDrawerView({ model }: { model: ReturnType<typeof useCartDrawer> }) {
  if (!model) return null;
  const { items, closeCart, removeItem, updateQuantity, totalItems, totalAmount, formatVND, handleCheckout } = model;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity" onClick={closeCart} />

      <div
        className="fixed right-0 top-0 h-full w-full max-w-md shadow-2xl z-50 flex flex-col animate-slide-in-right"
        style={{
          backgroundColor: 'var(--surface-bg)',
          borderLeft: '1px solid var(--border-default)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>
              YOUR SELECTION
            </span>
            <h2 className="font-serif-hero text-3xl" style={{ color: 'var(--text-primary)' }}>
              The bag. ({totalItems()})
            </h2>
          </div>
          <IconButton
            icon={<X className="w-5 h-5" />}
            onClick={closeCart}
            title="Close bag"
            size="sm"
          />
        </div>

        {/* Items list */}
        <CartItems items={items} closeCart={closeCart} formatVND={formatVND} updateQuantity={updateQuantity} removeItem={removeItem} />

        {/* Footer Summary */}
        {items.length > 0 && (
          <div
            className="p-6 space-y-3"
            style={{
              borderTop: '1px solid var(--border-default)',
              backgroundColor: 'var(--surface-bg)',
            }}
          >
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between" style={{ color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>{formatVND(totalAmount())}</span>
              </div>
              <div className="flex items-center justify-between" style={{ color: 'var(--text-secondary)' }}>
                <span>Delivery</span>
                <span style={{ color: 'var(--text-success)' }}>Calculated next</span>
              </div>
              <div
                className="flex items-center justify-between text-sm font-bold pt-2"
                style={{ borderTop: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              >
                <span>Total</span>
                <span className="text-base">{formatVND(totalAmount())}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full replit-btn-black py-3.5 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer mt-2"
            >
              <span>Proceed to checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );

}
