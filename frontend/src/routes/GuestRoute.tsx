import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Spinner } from '../components/common/Loader';

interface GuestRouteProps {
  children: React.ReactElement;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Spinner size="lg" label="Checking authentication..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/shop" replace />;
  }

  return children;
};
