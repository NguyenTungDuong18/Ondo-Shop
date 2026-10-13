import React from 'react';
import { VerifyOTPView } from '../components/VerifyOTPView';
import { useVerifyOTPPage } from '../hooks/useVerifyOTPPage';
export const VerifyOTPPage: React.FC = () => {
  const model = useVerifyOTPPage();
  return <VerifyOTPView model={model} />;
};
