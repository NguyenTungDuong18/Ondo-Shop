import { ArrowLeft, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { LinkButton } from '../../../shared/components/LinkButton';
import { CheckoutSummary } from './CheckoutSummary';
import { ShippingForm } from './ShippingForm';

import type { useCheckoutPage } from '../hooks/useCheckoutPage';
export function CheckoutView({ model }: { model: ReturnType<typeof useCheckoutPage> }) {
  if (!model) return null;
  const { navigate, items, totalAmount, createOrder, form, setForm, orderSuccess, orderNumber, formatVND, shippingFee, grandTotal, handleSubmit } = model;

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
        <ShippingForm form={form} setForm={setForm} />

        {/* Right: Order Summary */}
        <CheckoutSummary items={items} formatVND={formatVND} totalAmount={totalAmount} shippingFee={shippingFee} grandTotal={grandTotal} createOrder={createOrder} />
      </form>
    </div>
  );

}
