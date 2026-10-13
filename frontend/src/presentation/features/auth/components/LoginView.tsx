import { Link } from 'react-router-dom';
import { ToastContainer } from '../../../shared/components/ToastContainer';
import type { useLoginPage } from '../hooks/useLoginPage';
import { LoginForm } from './LoginForm';
export function LoginView({ model }: { model: ReturnType<typeof useLoginPage> }) {
  if (!model) return null;
  const { loginMutation, register, handleSubmit, errors, onSubmit, inputStyle } = model;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface-bg)' }}
    >
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: 'var(--surface-raised)' }}
      />

      <div
        className="w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10 animate-fade-in"
        style={{
          backgroundColor: 'var(--surface-modal)',
          border: '2px solid var(--border-default)',
        }}
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <span className="font-serif-hero text-4xl tracking-tight block">Onda.</span>
          </Link>
          <h2 className="font-serif italic text-2xl font-semibold">Đăng Nhập Tài Khoản</h2>
          <p className="text-xs font-medium mt-1 font-mono uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Cửa hàng Onda Studio & Management Portal
          </p>
        </div>

        <LoginForm handleSubmit={handleSubmit} onSubmit={onSubmit} register={register} inputStyle={inputStyle} errors={errors} loginMutation={loginMutation} />

        <div className="text-center mt-6 pt-6" style={{ borderTop: '1px solid var(--border-default)' }}>
          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold underline transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#6366f1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );

}
