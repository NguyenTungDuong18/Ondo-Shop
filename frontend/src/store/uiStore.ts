import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type AppTheme = 'light' | 'dark';

interface UIState {
  toasts: ToastMessage[];
  isSidebarOpen: boolean;
  theme: AppTheme;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
  toggleSidebar: () => void;
  setTheme: (theme: AppTheme) => void;
}

const getInitialTheme = (): AppTheme => {
  const saved = localStorage.getItem('onda_theme') as AppTheme;
  if (saved === 'dark' || saved === 'light') {
    if (saved === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    return saved;
  }
  return 'light';
};

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  isSidebarOpen: true,
  theme: getInitialTheme(),

  addToast: (type, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  setTheme: (theme: AppTheme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('onda_theme', theme);
    set({ theme });
  },
}));
