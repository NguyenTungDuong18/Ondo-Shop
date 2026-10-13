import React from 'react';

import { ProductsView } from '../components/ProductsView';
import { useProductsPage } from '../hooks/useProductsPage';
export const ProductsPage: React.FC = () => {
  const model = useProductsPage();
  return <ProductsView model={model} />;
};
