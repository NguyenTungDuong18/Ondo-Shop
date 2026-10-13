import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatVND as formatCurrency } from '../../../../shared/format/currency';
import { useProductDetailQuery } from '../../../hooks/useProductQueries';
import { useCartStore } from '../../../state/cartStore';

export function useProductDetailPage() {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const { data: response, isLoading, isError, error } = useProductDetailQuery(id);
  const product = response?.data;

  const formatVND = formatCurrency;

  const handleAddToCart = () => {
    if (!product || product.stockQuantity <= 0) return;
    addItem({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      productImageUrl: product.imageUrl ?? undefined,
      unitPrice: product.price,
      quantity: quantity,
      stockQuantity: product.stockQuantity,
    });
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };
  return { navigate, quantity, setQuantity, addedNotice, isLoading, isError, error, product, formatVND, handleAddToCart };
}
