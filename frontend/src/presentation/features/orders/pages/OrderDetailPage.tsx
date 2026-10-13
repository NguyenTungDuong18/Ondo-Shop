import React from 'react';
import { OrderDetailView } from '../components/OrderDetailView';
import { useOrderDetailPage } from '../hooks/useOrderDetailPage';
export const OrderDetailPage: React.FC = () => {
  const model = useOrderDetailPage();
  return <OrderDetailView model={model} />;
};
