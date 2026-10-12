import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useCreateOrderMutation } from '../hooks/useCartQueries';
import { useUIStore } from '../store/uiStore';
import { ShoppingBag, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { LinkButton } from '../components/common/LinkButton';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const createOrder = useCreateOrderMutation();
  const { addToast } = useUIStore();

  const [form, setForm] = useState({
    shippingName: user?.fullName || '',
    shippingPhone: '',
    shippingAddress: '',
    shippingNote: '',
  });
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const shippingFee = totalAmount() >= 500000 ? 0 : 30000;
  const grandTotal = totalAmount() + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shippingName || !form.shippingPhone || !form.shippingAddress) {
      addToast('error', 'Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin giao hÃ ng.');
      return;
    }
    try {
      const result = await createOrder.mutateAsync({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingName: form.shippingName,
        shippingPhone: form.shippingPhone,
        shippingAddress: form.shippingAddress,
        shippingNote: form.shippingNote || undefined,
      });
      if (result.success && result.data) {
        setOrderNumber(result.data.orderNumber);
        setOrderSuccess(true);
        clearCart();
      }
    } catch {
      addToast('error', 'Äáº·t hÃ ng tháº¥t báº¡i. Vui lÃ²ng thá»­ láº¡i.');
    }
  };

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-16 animate-fade-in">
        <ShoppingBag className="w-16 h-16 mx-auto" style={{ color: 'var(--text-muted)' }} />
        <h1 className="nike-title text-2xl">YOUR CART IS EMPTY</h1>
        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Add items to your cart before checking out.</p>
        <LinkButton to="/shop" variant="primary" size="md" icon={<ArrowLeft className="w-4 h-4" />}>
          Browse Shop
        </LinkButton>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-16 animate-fade-in">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(5,150,105,0.1)' }}>
          <CheckCircle2 className="w-10 h-10" style={{ color: 'var(--text-success)' }} />
        </div>
        <div>
          <h1 className="nike-title text-2xl">ORDER PLACED!</h1>
          <p className="nike-title text-sm" style={{ color: 'var(--text-secondary)' }}>Order #{orderNumber}</p>
        </div>
        <p className="text-xs font-medium max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Thank you for your order! We'll send you a confirmation email shortly.
        </p>
        <div className="flex flex-col gap-3">
          <LinkButton to="/my-orders" variant="primary" size="md" fullWidth>View My Orders</LinkButton>
          <LinkButton to="/shop" variant="outline" size="md" fullWidth>Continue Shopping</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      <div>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mb-4" icon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
        <h1 className="nike-title text-3xl">CHECKOUT</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Shipping Form */}
        <div className="lg:col-span-3 space-y-5">
          <div className="onda-modal rounded-3xl p-6 space-y-4">
            <h2 className="nike-title text-base border-b pb-3" style={{ borderColor: 'var(--border-default)' }}>SHIPPING INFORMATION</h2>

            <div className="space-y-3">
              {[
                { label: 'Full Name *', key: 'shippingName', type: 'text', placeholder: 'Nguyá»…n VÄƒn A' },
                { label: 'Phone Number *', key: 'shippingPhone', type: 'tel', placeholder: '0901234567' },
                { label: 'Shipping Address *', key: 'shippingAddress', type: 'text', placeholder: '123 ÄÆ°á»ng ABC, PhÆ°á»ng X, Quáº­n Y, TP. HCM', textarea: true },
                { label: 'Order Note (optional)', key: 'shippingNote', type: 'text', placeholder: 'Giao giá» hÃ nh chÃ­nh...' },
              ].map(({ label, key, type, placeholder, textarea }) => (
                <div key={key}>
                  <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</label>
                  {textarea ? (
                    <textarea
                      value={(form as any)[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="nike-input w-full px-4 py-2.5 text-sm resize-none"
                      rows={3} placeholder={placeholder} required={key === 'shippingAddress'} />
                  ) : (
                    <input
                      type={type}
                      value={(form as any)[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="nike-input w-full px-4 py-2.5 text-sm"
                      placeholder={placeholder} required={key !== 'shippingNote'} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2 space-y-4">
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
                  Add {formatVND(500000 - totalAmount())} more for free shipping
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
        </div>
      </form>
    </div>
  );
};
