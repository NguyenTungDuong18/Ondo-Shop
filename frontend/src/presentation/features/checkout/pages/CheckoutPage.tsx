import React from 'react';

import { CheckoutView } from '../components/CheckoutView';
import { useCheckoutPage } from '../hooks/useCheckoutPage';
export const CheckoutPage: React.FC = () => {
  const model = useCheckoutPage();
  return <CheckoutView model={model} />;
};
