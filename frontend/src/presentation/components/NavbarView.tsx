import {
  LogIn,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  User as UserIcon,
  UserPlus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../shared/components/Badge';
import { Button } from '../shared/components/Button';
import { ColorModeToggle } from '../shared/components/ColorModeToggle';
import { IconButton } from '../shared/components/IconButton';
import { LinkButton } from '../shared/components/LinkButton';
import { LiquidAvatar } from '../shared/components/LiquidAvatar';

import type { useNavbar } from '../hooks/useNavbar';
export function NavbarView({ model }: { model: ReturnType<typeof useNavbar> }) {
  if (!model) return null;
  const { navigate, location, user, isAuthenticated, toggleSidebar, theme, setTheme, openCart, isUserDropdownOpen, setIsUserDropdownOpen, searchQuery, setSearchQuery, userDropdownRef, cartCount, isOurEdit, isShop, handleLogout, handleSearchSubmit } = model;

  return (
    <header
      className="sticky top-0 z-40 w-full transition-all"
      style={{ backgroundColor: 'var(--surface-bg)', borderBottom: '1px solid var(--border-default)' }}
    >
      {/* Top Announcement Bar */}
      <div
        className="border-b py-1.5 px-4 lg:px-8 w-full text-[11px] font-mono tracking-wider"
        style={{
          backgroundColor: 'var(--surface-bg)',
          borderColor: 'var(--border-default)',
          color: 'var(--text-secondary)',
        }}
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>ONDA STUDIO — CURATED OBJECTS FOR MODERN LIVING</span>
          </div>
          <p className="mx-auto sm:mx-0 text-center sm:text-left" style={{ color: 'var(--text-muted)' }}>
            Complimentary shipping on orders over $100 · Crafted slowly
          </p>
          <div className="hidden lg:flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>System Active</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div
        className="w-full max-w-7xl mx-auto px-4 lg:px-8 h-18 flex items-center justify-between gap-4 transition-colors"
        style={{ backgroundColor: 'var(--surface-bg)' }}
      >
        {/* Left: Sidebar Toggle + Brand Logo */}
        <div className="flex items-center gap-3 lg:gap-8">
          <IconButton
            icon={<Menu className="w-5 h-5" />}
            onClick={toggleSidebar}
            title="Toggle Menu"
          />

          <Link to="/" className="flex items-center gap-2">
            <span
              className="font-serif-hero text-3xl sm:text-4xl tracking-tight leading-none hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-primary)' }}
            >
              Onda.
            </span>
          </Link>

          {/* Main Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest">
            <Link to="/shop" className={`px-3 py-1.5 rounded-full transition-all font-mono uppercase tracking-widest onda-nav-link ${isShop ? 'active' : ''}`}>
              Shop
            </Link>
            <Link to="/shop?view=edit&sortBy=createdAt&sortOrder=desc" className={`px-3 py-1.5 rounded-full transition-all font-mono uppercase tracking-widest onda-nav-link ${isOurEdit ? 'active' : ''}`}>
              Our edit
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/products" className={`px-3 py-1.5 rounded-full transition-all font-mono uppercase tracking-widest onda-nav-link ${location.pathname === '/products' ? 'active' : ''}`}>
                  Management
                </Link>
                <Link to="/test-chat" className={`px-3 py-1.5 rounded-full transition-all font-mono uppercase tracking-widest onda-nav-link ${location.pathname === '/test-chat' ? 'active' : ''}`}>
                  Concierge
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search objects, materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full text-xs font-sans outline-none transition-all"
              style={{
                backgroundColor: 'var(--surface-raised)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-focus)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
              }}
            />
          </div>
        </form>

        {/* Right: Theme Toggle, Cart & Auth */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <ColorModeToggle value={theme} onChange={setTheme} size="sm" />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={openCart}
            className="group rounded-full"
            title="Open Bag"
            icon={<ShoppingBag className="w-4 h-4 transition-transform group-hover:-rotate-6" />}
          >
            <span className="font-bold">Bag</span>
            <span
              className="font-mono text-[10px] px-1.5 py-0.5 rounded-full font-bold"
              style={{
                backgroundColor: 'var(--btn-primary-bg)',
                color: 'var(--btn-primary-text)',
              }}
            >
              {cartCount}
            </span>
          </Button>

          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <LinkButton to="/login" variant="outline" size="sm" icon={<LogIn className="w-3.5 h-3.5" />}>
                Sign in
              </LinkButton>
              <LinkButton to="/register" variant="primary" size="sm" icon={<UserPlus className="w-3.5 h-3.5" />}>
                Join
              </LinkButton>
            </div>
          ) : (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-0.5 rounded-full transition-all cursor-pointer"
                title="Member Profile"
              >
                <LiquidAvatar name={user?.fullName || user?.username} avatarUrl={user?.avatarUrl} size={36} />
              </button>

              {isUserDropdownOpen && (
                <div
                  className="absolute left-[calc(100%+0.625rem)] top-0 w-64 rounded-2xl shadow-xl p-2 z-50 animate-user-menu space-y-1"
                  style={{
                    backgroundColor: 'var(--surface-dropdown)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <div
                    className="p-3 rounded-xl mb-1"
                    style={{
                      backgroundColor: 'var(--surface-raised)',
                      borderBottom: '1px solid var(--border-default)',
                    }}
                  >
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>STUDIO MEMBER</p>
                    <p className="text-sm font-semibold truncate mt-0.5" style={{ color: 'var(--text-primary)' }}>{user?.fullName || user?.username}</p>
                    <p className="text-xs font-mono truncate" style={{ color: 'var(--text-secondary)' }}>@{user?.username}</p>
                    <Badge variant={user?.role === 'Admin' ? 'purple' : 'info'} className="mt-1.5 text-[10px]">
                      {user?.role}
                    </Badge>
                  </div>

                  <Button variant="ghost" size="xs" onClick={() => { setIsUserDropdownOpen(false); navigate('/profile'); }}
                    className="w-full justify-start rounded-lg font-medium normal-case tracking-normal"
                    icon={<UserIcon className="w-4 h-4" />}>
                    Member profile
                  </Button>

                  <Button variant="ghost" size="xs" onClick={() => { setIsUserDropdownOpen(false); navigate('/my-orders'); }}
                    className="w-full justify-start rounded-lg font-medium normal-case tracking-normal"
                    icon={<Package className="w-4 h-4" />}>
                    My orders
                  </Button>

                  <div className="pt-1" style={{ borderTop: '1px solid var(--border-default)' }}>
                    <Button variant="ghost" size="xs" onClick={handleLogout}
                      className="w-full justify-start rounded-lg font-medium normal-case tracking-normal cursor-pointer"
                      style={{ color: 'var(--text-danger)' }}
                      icon={<LogOut className="w-4 h-4" />}>
                      Sign out
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );

}
