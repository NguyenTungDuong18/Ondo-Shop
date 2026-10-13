import { ArrowLeft, Mail, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MAX_RESEND, RESEND_WINDOW_SECONDS } from '../../../../shared/config/otp';
import { ToastContainer } from '../../../shared/components/ToastContainer';
import type { useVerifyOTPPage } from '../hooks/useVerifyOTPPage';
import { OtpInput } from './OtpInput';
export function VerifyOTPView({ model }: { model: ReturnType<typeof useVerifyOTPPage> }) {
  if (!model) return null;
  const { email, otpValue, setOtpValue, secondsLeft, resendCount, resendCooldown, isLoading, canResend, isExpired, formatTime, handleResend } = model;

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-100">
        <div className="text-center bg-white p-8 rounded-3xl border-2 border-zinc-950 shadow-2xl">
          <p className="text-zinc-700 font-bold mb-4 font-mono">Không tìm thấy email xác thực.</p>
          <Link to="/register" className="text-zinc-950 font-bold underline font-mono text-xs"> Quay lại đăng ký</Link>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-100 text-zinc-900 relative overflow-hidden">
      {/* High Contrast Background Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-zinc-300/40 rounded-full blur-3xl pointer-events-none" />

      {/* High Contrast Auth Card */}
      <div className="bg-white w-full max-w-md p-8 sm:p-10 rounded-3xl border-2 border-zinc-950 shadow-2xl relative z-10 animate-fade-in my-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-600 hover:text-zinc-950 transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay về trang chủ</span>
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-zinc-950 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Mail className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="font-serif italic text-2xl font-semibold text-zinc-950">Xác thực Email</h2>
          <p className="text-xs text-zinc-600 font-medium mt-2">
            Nhập mã gồm <strong className="text-zinc-950 font-bold font-mono">6 chữ số</strong> đã được gửi đến
          </p>
          <p className="text-xs font-bold text-zinc-950 mt-1 font-mono bg-zinc-100 px-3 py-1 rounded-lg inline-block border border-zinc-300">{email}</p>
        </div>

        {/* High Contrast Countdown */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`text-xs font-mono font-bold px-3.5 py-2 rounded-xl border-2 ${secondsLeft <= 60
              ? 'text-rose-600 border-rose-600 bg-rose-50'
              : 'text-zinc-950 border-zinc-950 bg-zinc-50 shadow-xs'
            }`}>
            {isExpired ? 'Đã hết hạn' : `Thời gian còn lại: ${formatTime(secondsLeft)}`}
          </div>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <OtpInput
            length={6}
            value={otpValue}
            onChange={setOtpValue}
            disabled={isLoading || isExpired}
          />
        </div>

        {/* Submit hint */}
        <p className="text-center text-xs font-mono font-semibold text-zinc-500 mb-6">
          {isLoading ? 'Đang xác thực mã...' : 'Mã sẽ tự động kích hoạt khi nhập đủ 6 số'}
        </p>

        {/* Resend Action Button with Color Inversion Light Beam Sweep Effect */}
        <div className="text-center space-y-3">
          {resendCooldown > 0 ? (
            <p className="text-xs font-mono text-zinc-500">
              Có thể yêu cầu gửi lại sau {formatTime(resendCooldown)}
            </p>
          ) : canResend ? (
            <button
              onClick={handleResend}
              disabled={isLoading}
              className="btn-spotlight-sweep w-full py-3.5 text-xs font-mono uppercase tracking-widest inline-flex items-center justify-center gap-2 disabled:opacity-50 font-bold shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Gửi lại mã OTP ({MAX_RESEND - resendCount} lần còn lại)</span>
            </button>
          ) : (
            <p className="text-xs font-mono font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              Đã hết lượt gửi lại. Vui lòng đợi {formatTime(RESEND_WINDOW_SECONDS)} phút.
            </p>
          )}
        </div>

        <div className="text-center mt-6 pt-6 border-t border-zinc-200">
          <p className="text-xs text-zinc-600 font-medium">
            Chưa nhận được email?{' '}
            <Link to="/register" className="text-zinc-950 font-bold underline hover:text-blue-600 transition-colors">Đăng ký lại</Link>
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );

}
