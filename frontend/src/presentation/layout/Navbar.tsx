import React from 'react';

import { NavbarView } from '../components/NavbarView';
import { useNavbar } from '../hooks/useNavbar';
export const Navbar: React.FC = () => {
  const model = useNavbar();
  return <NavbarView model={model} />;
};
