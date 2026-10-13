import React from 'react';
import { RegisterView } from '../components/RegisterView';
import { useRegisterPage } from '../hooks/useRegisterPage';
export const RegisterPage: React.FC = () => {
  const model = useRegisterPage();
  return <RegisterView model={model} />;
};
