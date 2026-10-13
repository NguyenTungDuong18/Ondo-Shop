import React from 'react';
import type { ProductResponse } from '../../../../domain/models/product';
import { useShopProductCard } from '../hooks/useShopProductCard';
import { ShopProductCardView } from './ShopProductCardView';
interface ShopProductCardProps {
  product: ProductResponse;
}
export const ShopProductCard: React.FC<ShopProductCardProps> = ({ product }) => {
  const model = useShopProductCard({ product });
  return <ShopProductCardView model={model} />;
};
