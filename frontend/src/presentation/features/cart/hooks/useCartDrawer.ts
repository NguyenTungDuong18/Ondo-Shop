import { useNavigate } from 'react-router-dom';
import { formatVND as formatCurrency } from '../../../../shared/format/currency';
import { useCartStore } from '../../../state/cartStore';

export function useCartDrawer() {

  const { items, isCartOpen, closeCart, removeItem, updateQuantity, totalItems, totalAmount } = useCartStore();
  const navigate = useNavigate();

  const formatVND = formatCurrency;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  if (!isCartOpen) return null;
  return { items, closeCart, removeItem, updateQuantity, totalItems, totalAmount, formatVND, handleCheckout };
}
