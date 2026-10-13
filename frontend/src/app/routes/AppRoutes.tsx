import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '../../presentation/layout/MainLayout';
import { Spinner } from '../../presentation/shared/components/Loader';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';

const LoginPage = lazy(() => import('../../presentation/features/auth/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('../../presentation/features/auth/pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const VerifyOTPPage = lazy(() => import('../../presentation/features/auth/pages/VerifyOTPPage').then(module => ({ default: module.VerifyOTPPage })));
const HomePage = lazy(() => import('../../presentation/features/catalog/pages/HomePage').then(module => ({ default: module.HomePage })));
const ProductDetailPage = lazy(() => import('../../presentation/features/catalog/pages/ProductDetailPage').then(module => ({ default: module.ProductDetailPage })));
const ShopPage = lazy(() => import('../../presentation/features/catalog/pages/ShopPage').then(module => ({ default: module.ShopPage })));
const ChatTestPage = lazy(() => import('../../presentation/features/chat/pages/ChatTestPage').then(module => ({ default: module.ChatTestPage })));
const CheckoutPage = lazy(() => import('../../presentation/features/checkout/pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })));
const DashboardPage = lazy(() => import('../../presentation/features/dashboard/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const NotFoundPage = lazy(() => import('../../presentation/features/errors/pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));
const ProductsPage = lazy(() => import('../../presentation/features/inventory/pages/ProductsPage').then(module => ({ default: module.ProductsPage })));
const MyOrdersPage = lazy(() => import('../../presentation/features/orders/pages/MyOrdersPage').then(module => ({ default: module.MyOrdersPage })));
const OrderDetailPage = lazy(() => import('../../presentation/features/orders/pages/OrderDetailPage').then(module => ({ default: module.OrderDetailPage })));
const ProfilePage = lazy(() => import('../../presentation/features/profile/pages/ProfilePage').then(module => ({ default: module.ProfilePage })));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Spinner label="Loading page..." />}><Routes>
      {/* Auth pages — only for unauthenticated users */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route
        path="/verify-otp"
        element={<VerifyOTPPage />}
      />

      {/* Public shop — accessible by everyone (guests + logged-in users) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />

        {/* Checkout — requires login */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        {/* Protected: requires login */}
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Protected: requires admin role */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/test-chat" element={<ChatTestPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes></Suspense>
  );
};
