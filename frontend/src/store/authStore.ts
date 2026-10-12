import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponse } from '../types/auth';
import { authService } from '../services/auth.service';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setUser: (user: UserResponse | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  verifyOtp: {
    isPending: boolean;
    verifyOtpAsync: (email: string, otp: string) => Promise<{ user: UserResponse; token: string } | null>;
  };
  sendOtp: {
    isPending: boolean;
    sendOtpAsync: (email: string) => Promise<string>;
  };
  refreshToken: {
    isPending: boolean;
    refreshAsync: () => Promise<boolean>;
  };
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitializing: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isInitializing: false,
        }),

      clearAuth: () =>
        set({
          user: null,
          isAuthenticated: false,
          isInitializing: false,
        }),

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        // No token = guest. No need to call /me — skip entirely.
        if (!token) {
          set({ user: null, isAuthenticated: false, isInitializing: false });
          return;
        }

        // Has token = verify it with backend
        try {
          const res = await authService.getProfile();
          if (res.success && res.data) {
            set({ user: res.data, isAuthenticated: true, isInitializing: false });
          } else {
            localStorage.removeItem('token');
            set({ user: null, isAuthenticated: false, isInitializing: false });
          }
        } catch {
          // Token exists but /me failed → stay on guest state
          // Don't redirect here — let routes handle auth requirements
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false, isInitializing: false });
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (e) {
          console.error('Logout error', e);
        } finally {
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false, isInitializing: false });
        }
      },

      verifyOtp: {
        isPending: false,
        async verifyOtpAsync(email: string, otp: string) {
          set((state) => ({
            verifyOtp: { ...state.verifyOtp, isPending: true },
          }));
          try {
            const res = await authService.verifyOtp({ email, otpCode: otp });
            if (res.success && res.data) {
              return {
                user: res.data.user,
                token: res.data.token,
              };
            }
            return null;
          } finally {
            set((state) => ({
              verifyOtp: { ...state.verifyOtp, isPending: false },
            }));
          }
        },
      },

      sendOtp: {
        isPending: false,
        async sendOtpAsync(email: string) {
          set((state) => ({
            sendOtp: { ...state.sendOtp, isPending: true },
          }));
          try {
            const res = await authService.sendOtp({ email });
            return res.message || 'Đã gửi mã OTP';
          } finally {
            set((state) => ({
              sendOtp: { ...state.sendOtp, isPending: false },
            }));
          }
        },
      },

      refreshToken: {
        isPending: false,
        async refreshAsync() {
          set((state) => ({
            refreshToken: { ...state.refreshToken, isPending: true },
          }));
          try {
            const res = await authService.refreshToken();
            if (res.success && res.data) {
              localStorage.setItem('token', res.data.token);
              set({ user: res.data.user, isAuthenticated: true });
              return true;
            }
            return false;
          } catch {
            localStorage.removeItem('token');
            set({ user: null, isAuthenticated: false, isInitializing: false });
            return false;
          } finally {
            set((state) => ({
              refreshToken: { ...state.refreshToken, isPending: false },
            }));
          }
        },
      },
    }),
    {
      name: 'mysystem-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// JWT decode helper
export function decodeJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ?? null;
  } catch {
    return null;
  }
}

// Check if token is expiring within N seconds
export function isTokenExpiringSoon(token: string, withinSeconds: number = 30 * 60): boolean {
  const exp = decodeJwtExp(token);
  if (exp == null) return true;
  return exp - Math.floor(Date.now() / 1000) < withinSeconds;
}
