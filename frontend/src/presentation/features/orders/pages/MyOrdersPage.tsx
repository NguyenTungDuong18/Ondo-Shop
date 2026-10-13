import React from 'react';
import { MyOrdersView } from '../components/MyOrdersView';
import { useMyOrdersPage } from '../hooks/useMyOrdersPage';
export const MyOrdersPage: React.FC = () => {
  const model = useMyOrdersPage();
  return <MyOrdersView model={model} />;
};
