import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { Home, X, ChevronRight, MessageSquare, ShoppingBag, ShieldCheck } from 'lucide-react';
import { IconButton } from '../common/IconButton';

export const Sidebar: React.FC = () => {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const { isAuthenticated } = useAuthStore();

  if (!isSidebarOpen) return null;

  const publicNavItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop Collection', path: '/shop', icon: ShoppingBag },
  ];

  const protectedNavItems = [
    { label: 'Management', path: '/products', icon: ShieldCheck },
    { label: 'Concierge', path: '/test-chat', icon: MessageSquare },
  ];

  const navItems = isAuthenticated ? [...publicNavItems, ...protectedNavItems] : publicNavItems;

  return (
    <>
      <div onClick={toggleSidebar} className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden" />

      <aside
        className="w-72 flex flex-col justify-between shrink-0 p-6 fixed lg:sticky top-24 z-30 h-[calc(100vh-6rem)] transition-all animate-slide-up shadow-xl"
        style={{
          backgroundColor: 'var(--surface-nav)',
          borderRight: '1px solid var(--border-default)',
        }}
      >
        <div className="space-y-6">
          <div
            className="flex items-center justify-between pb-3"
            style={{ borderBottom: '1px solid var(--border-default)' }}
          >
            <p className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              STUDIO NAVIGATION
            </p>
            <div className="lg:hidden">
              <IconButton
                icon={<X className="w-5 h-5" />}
                onClick={toggleSidebar}
                title="Close Menu"
                size="sm"
              />
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-150 ${
                      isActive
                        ? 'onda-sidebar-link active'
                        : 'onda-sidebar-link'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="pt-4" style={{ borderTop: '1px solid var(--border-default)' }}>
          <div
            className="p-4 rounded-2xl space-y-1"
            style={{
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
            }}
          >
            <p className="font-serif italic text-lg" style={{ color: 'var(--text-primary)' }}>Onda Studio</p>
            <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Made slowly, wherever possible.</p>
          </div>
        </div>
      </aside>
    </>
  );
};
