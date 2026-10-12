import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { ToastContainer } from '../common/ToastContainer';
import { FloatingAiChat } from './FloatingAiChat';
import { useUIStore } from '../../store/uiStore';
import { CartDrawer } from '../cart/CartDrawer';

export const MainLayout: React.FC = () => {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ backgroundColor: 'var(--surface-bg)', color: 'var(--text-primary)' }}
    >
      <Navbar />

      <div className="flex flex-1">
        {isSidebarOpen && <Sidebar />}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-[1440px] mx-auto w-full">
          <Outlet />
        </main>
      </div>

      <Footer />
      <ToastContainer />
      <FloatingAiChat />
      <CartDrawer />
    </div>
  );
};
