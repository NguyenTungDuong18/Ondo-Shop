import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { session } from '../../../../application/services/session';
import { MAX_RESEND, OTP_EXPIRATION_SECONDS, RESEND_WINDOW_SECONDS } from '../../../../shared/config/otp';
import { useAuthStore } from '../../../state/authStore';
import { useUIStore } from '../../../state/uiStore';
export function useVerifyOTPPage() {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get('email') || '';
  const [otpValue, setOtpValue] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRATION_SECONDS);
  const [resendCount, setResendCount] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  const addToast = useUIStore((state) => state.addToast);

  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const sendOtp = useAuthStore((state) => state.sendOtp);
  const setUser = useAuthStore((state) => state.setUser);

  const isLoading = verifyOtp.isPending || sendOtp.isPending;
  const canResend = resendCount < MAX_RESEND && resendCooldown === 0;
  const isExpired = secondsLeft === 0;

  // Countdown timer
  useEffect(() => {
    if (secondsLeft === 0 || isLoading) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, isLoading]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown === 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleResend = useCallback(async () => {
    if (!canResend || !email) return;
    try {
      await sendOtp.sendOtpAsync(email);
      setResendCount((prev) => prev + 1);
      setResendCooldown(RESEND_WINDOW_SECONDS);
      setSecondsLeft(OTP_EXPIRATION_SECONDS);
      setOtpValue('');
      addToast('success', 'Đã gửi lại mã OTP. Vui lòng kiểm tra email.');
    } catch {
      addToast('error', 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
    }
  }, [canResend, email, sendOtp, addToast]);

  const handleOtpComplete = useCallback(async (otp: string) => {
    if (!email || otp.length !== 6) return;
    try {
      const result = await verifyOtp.verifyOtpAsync(email, otp);
      if (result) {
        setUser(result.user);
        session.setToken(result.token);
        addToast('success', 'Xác thực email thành công!');
        navigate('/shop');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Mã xác thực không đúng. Vui lòng thử lại.';
      addToast('error', errorMessage);
      setOtpValue('');
    }
  }, [email, verifyOtp, setUser, addToast, navigate]);

  // Auto-verify when 6 digits are entered
  useEffect(() => {
    if (otpValue.length === 6) {
      handleOtpComplete(otpValue);
    }
  }, [otpValue, handleOtpComplete]);
  return { email, otpValue, setOtpValue, secondsLeft, resendCount, resendCooldown, isLoading, canResend, isExpired, formatTime, handleResend };
}
