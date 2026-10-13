import React from 'react';

import { DashboardView } from '../components/DashboardView';
import { useDashboardPage } from '../hooks/useDashboardPage';
export const DashboardPage: React.FC = () => {
  const model = useDashboardPage();
  return <DashboardView model={model} />;
};
