import React from 'react';
import { ShopView } from '../components/ShopView';
import { useShopPage } from '../hooks/useShopPage';
export const ShopPage: React.FC = () => {
  const model = useShopPage();
  return <ShopView model={model} />;
};
