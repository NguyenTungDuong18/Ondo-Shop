import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateShippingFee } from '../../../../domain/policies/shipping';
import { shippingPolicy } from '../../../../shared/config/commerce';
import { formatVND as formatCurrency } from '../../../../shared/format/currency';
import { useCreateOrderMutation } from '../../../hooks/useOrderQueries';
import { useAuthStore } from '../../../state/authStore';
import { useCartStore } from '../../../state/cartStore';
import { useUIStore } from '../../../state/uiStore';

export function useCheckoutPage() {

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

  const formatVND = formatCurrency;

  const shippingFee = calculateShippingFee(totalAmount(), shippingPolicy);
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
  return { navigate, items, totalAmount, createOrder, form, setForm, orderSuccess, orderNumber, formatVND, shippingFee, grandTotal, handleSubmit };
}
