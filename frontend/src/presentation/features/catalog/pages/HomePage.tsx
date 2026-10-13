import React from 'react';

import { HomeView } from '../components/HomeView';
import { useHomePage } from '../hooks/useHomePage';
export const HomePage: React.FC = () => {
  const model = useHomePage();
  return <HomeView model={model} />;
};
