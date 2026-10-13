import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProductResponse } from '../../../../domain/models/product';
import { formatVND as formatCurrency } from '../../../../shared/format/currency';
import { useCartStore } from '../../../state/cartStore';
interface ShopProductCardProps {
  product: ProductResponse;
}
export function useShopProductCard({ product }: ShopProductCardProps) {

  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const formatVND = formatCurrency;

  const imageSrc = product.imageUrl ?? undefined;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stockQuantity <= 0) return;
    addItem({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      productImageUrl: imageSrc,
      unitPrice: product.price,
      quantity: 1,
      stockQuantity: product.stockQuantity,
    });
  };
  return { navigate, formatVND, imageSrc, handleAddToCart, product };
}
