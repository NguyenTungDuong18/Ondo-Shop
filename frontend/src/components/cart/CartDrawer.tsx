import React from 'react';
import { useCartStore } from '../../store/cartStore';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { IconButton } from '../common/IconButton';

export const CartDrawer: React.FC = () => {
  const { items, isCartOpen, closeCart, removeItem, updateQuantity, totalItems, totalAmount } = useCartStore();
  const navigate = useNavigate();

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
        </div>

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
};
