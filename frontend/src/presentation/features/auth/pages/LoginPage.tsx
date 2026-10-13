import React from 'react';
import { LoginView } from '../components/LoginView';
import { useLoginPage } from '../hooks/useLoginPage';
export const LoginPage: React.FC = () => {
  const model = useLoginPage();
  return <LoginView model={model} />;
};
