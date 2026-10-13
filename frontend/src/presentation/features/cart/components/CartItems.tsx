import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IconButton } from '../../../shared/components/IconButton';
import type { useCartDrawer } from '../hooks/useCartDrawer';
type Props = {
  items: NonNullable<ReturnType<typeof useCartDrawer>>['items'];
  closeCart: NonNullable<ReturnType<typeof useCartDrawer>>['closeCart'];
  formatVND: NonNullable<ReturnType<typeof useCartDrawer>>['formatVND'];
  updateQuantity: NonNullable<ReturnType<typeof useCartDrawer>>['updateQuantity'];
  removeItem: NonNullable<ReturnType<typeof useCartDrawer>>['removeItem'];
};
export function CartItems({ items, closeCart, formatVND, updateQuantity, removeItem }: Props) {
  return (<div className="flex-1 overflow-y-auto p-6 space-y-4">
    {items.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-muted)' }}
        >
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="font-serif italic text-2xl" style={{ color: 'var(--text-primary)' }}>A little empty in here.</h3>
          <p className="text-xs font-sans max-w-xs" style={{ color: 'var(--text-secondary)' }}>
            The best rooms start with one good object.
          </p>
        </div>
        <Link to="/shop" onClick={closeCart}
          className="replit-btn-black px-6 py-3 text-xs inline-flex items-center gap-2 font-mono uppercase tracking-wider">
          <span>Shop the edit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    ) : (
      items.map((item) => (
        <div
          key={item.productId}
          className="flex gap-4 p-4 rounded-xl"
          style={{
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border-default)',
          }}
        >
          <div
            className="w-20 h-20 rounded-lg overflow-hidden shrink-0"
            style={{
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
            }}
          >
            <img
              src={item.productImageUrl ?? undefined}
              alt={item.productName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-mono uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                {item.productSku}
              </span>
              <h3 className="text-xs font-medium truncate font-sans" style={{ color: 'var(--text-primary)' }}>{item.productName}</h3>
              <p className="text-xs font-mono font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{formatVND(item.unitPrice)}</p>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2"
              style={{ borderTop: '1px solid var(--border-default)' }}
            >
              <div
                className="flex items-center gap-2 rounded-md px-1 py-0.5"
                style={{
                  backgroundColor: 'var(--surface-card)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <IconButton
                  icon={<Minus className="w-3 h-3" />}
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  size="xs"
                  title="Decrease quantity"
                />
                <span className="text-xs font-mono font-bold w-5 text-center" style={{ color: 'var(--text-primary)' }}>{item.quantity}</span>
                <IconButton
                  icon={<Plus className="w-3 h-3" />}
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  size="xs"
                  disabled={item.quantity >= item.stockQuantity}
                  title="Increase quantity"
                />
              </div>

              <IconButton
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => removeItem(item.productId)}
                variant="danger"
                size="sm"
                title="Remove item"
              />
            </div>
          </div>
        </div>
      ))
    )}
  </div>);
}
