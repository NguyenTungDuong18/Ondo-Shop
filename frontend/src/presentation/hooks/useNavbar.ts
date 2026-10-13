import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import { useCartStore } from '../state/cartStore';
import { useUIStore } from '../state/uiStore';
import { useLogoutMutation } from './useAuthQueries';

export function useNavbar() {

  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogoutMutation();
  const { toggleSidebar, theme, setTheme } = useUIStore();
  const { totalItems, openCart } = useCartStore();

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const cartCount = totalItems();
  const isOurEdit = location.pathname === '/shop' && new URLSearchParams(location.search).get('view') === 'edit';
  const isShop = location.pathname === '/shop' && !isOurEdit;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsUserDropdownOpen(false);
    await logoutMutation.mutateAsync();
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
  };
  return { navigate, location, user, isAuthenticated, toggleSidebar, theme, setTheme, openCart, isUserDropdownOpen, setIsUserDropdownOpen, searchQuery, setSearchQuery, userDropdownRef, cartCount, isOurEdit, isShop, handleLogout, handleSearchSubmit };
}
