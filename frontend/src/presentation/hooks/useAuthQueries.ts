import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../application/services/authService';
import { session } from '../../application/services/session';
import type { LoginRequest, RegisterRequest, UpdateProfileRequest } from '../../domain/models/auth';
import { useAuthStore } from '../state/authStore';
import { useUIStore } from '../state/uiStore';

export const useLoginMutation = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const addToast = useUIStore((state) => state.addToast);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (res) => {
      if (res.success && res.data) {
        const data = res.data as any;
        if (data.requiresEmailVerification) {
          // ChÆ°a verify email â†’ chuyá»ƒn sang trang OTP
          addToast('info', 'TÃ i khoáº£n chÆ°a xÃ¡c thá»±c email. MÃ£ OTP Ä‘Ã£ Ä‘Æ°á»£c gá»­i.');
          navigate(`/verify-otp?email=${encodeURIComponent(data.email || '')}`);
        } else {
          // ÄÃ£ verify â†’ res.data chá»©a token & user trá»±c tiáº¿p (hoáº·c data.loginData)
          const loginData = data.loginData || data;
          if (loginData && loginData.token) {
            session.setToken(loginData.token);
            setUser(loginData.user);
            addToast('success', 'ÄÄƒng nháº­p thÃ nh cÃ´ng!');
            navigate('/shop');
          }
        }
      }
    },
    onError: (error: Error) => {
      addToast('error', error.message || 'ÄÄƒng nháº­p tháº¥t báº¡i. Vui lÃ²ng kiá»ƒm tra láº¡i thÃ´ng tin.');
    },
  });
};

export const useRegisterMutation = () => {
  const addToast = useUIStore((state) => state.addToast);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (res, variables) => {
      if (res.success) {
        addToast('success', res.message || 'ÄÄƒng kÃ½ tÃ i khoáº£n thÃ nh cÃ´ng!');
        navigate(`/verify-otp?email=${encodeURIComponent(variables.email)}`);
      }
    },
    onError: (error: Error) => {
      addToast('error', error.message || 'ÄÄƒng kÃ½ tháº¥t báº¡i. Vui lÃ²ng kiá»ƒm tra láº¡i.');
    },
  });
};

export const useLogoutMutation = () => {
  const logoutStore = useAuthStore((state) => state.clearAuth);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: (res) => {
      session.clearToken();
      logoutStore();
      addToast('info', res.message || 'ÄÃ£ Ä‘Äƒng xuáº¥t khá»i há»‡ thá»‘ng.');
    },
    onError: () => {
      logoutStore();
      addToast('info', 'ÄÃ£ Ä‘Äƒng xuáº¥t.');
    },
  });
};

export const useUpdateProfileMutation = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authService.updateProfile(data),
    onSuccess: (res) => {
      if (res.success && res.data) {
        setUser(res.data);
        addToast('success', res.message || 'Profile updated successfully.');
      }
    },
    onError: (error: Error) => {
      addToast('error', error.message || 'Unable to update profile.');
    },
  });
};