import React from 'react';

import { useCartDrawer } from '../hooks/useCartDrawer';
import { CartDrawerView } from './CartDrawerView';
export const CartDrawer: React.FC = () => {
  const model = useCartDrawer();
  return <CartDrawerView model={model} />;
};
