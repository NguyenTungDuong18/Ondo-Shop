import React from 'react';

import { ProductDetailView } from '../components/ProductDetailView';
import { useProductDetailPage } from '../hooks/useProductDetailPage';
export const ProductDetailPage: React.FC = () => {
  const model = useProductDetailPage();
  return <ProductDetailView model={model} />;
};
