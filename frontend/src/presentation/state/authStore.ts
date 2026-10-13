import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../../application/services/authService';
import { session } from '../../application/services/session';
import type { UserResponse } from '../../domain/models/auth';

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
        const token = session.getToken();
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
            session.clearToken();
            set({ user: null, isAuthenticated: false, isInitializing: false });
          }
        } catch {
          // Token exists but /me failed → stay on guest state
          // Don't redirect here — let routes handle auth requirements
          session.clearToken();
          set({ user: null, isAuthenticated: false, isInitializing: false });
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (e) {
          console.error('Logout error', e);
        } finally {
          session.clearToken();
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
              session.setToken(res.data.token);
              set({ user: res.data.user, isAuthenticated: true });
              return true;
            }
            return false;
          } catch {
            session.clearToken();
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

