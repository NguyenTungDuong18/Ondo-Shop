import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useLoginMutation } from '../hooks/useAuthQueries';
import type { LoginRequest } from '../types/auth';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { ToastContainer } from '../components/common/ToastContainer';

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Vui lòng nhập Username hoặc Email'),
  password: z.string().min(1, 'Vui lòng nhập Mật khẩu'),
});

type LoginValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: 'admin',
      password: 'Admin@123',
    },
  });

  const onSubmit = (data: LoginValues) => {
    loginMutation.mutate(data as LoginRequest);
  };

  const inputStyle = {
    backgroundColor: 'var(--surface-raised)',
    color: 'var(--text-primary)',
    border: '2px solid var(--border-strong)',
  };

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

        <div
          className="p-4 rounded-2xl mb-6 text-xs flex items-start gap-3 shadow-md"
          style={{
            backgroundColor: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            border: '1px solid var(--border-default)',
          }}
        >
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold font-mono uppercase tracking-wider text-[11px]">Tài khoản thử nghiệm mặc định:</p>
            <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
              User: <strong style={{ color: 'var(--text-inverse)' }}>admin</strong> | Pass: <strong style={{ color: 'var(--text-inverse)' }}>Admin@123</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-5">
          <div>
            <label className="block text-xs font-mono font-bold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Tên đăng nhập hoặc Email *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                {...register('usernameOrEmail')}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-xs font-sans placeholder font-medium outline-none transition-all"
                style={inputStyle}
                placeholder="admin"
              />
            </div>
            {errors.usernameOrEmail && (
              <p className="text-xs font-bold mt-1" style={{ color: 'var(--text-danger)' }}>{errors.usernameOrEmail.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-bold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Mật khẩu *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="password"
                {...register('password')}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-xs font-sans placeholder font-medium outline-none transition-all"
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-xs font-bold mt-1" style={{ color: 'var(--text-danger)' }}>{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="btn-spotlight-sweep w-full py-3.5 text-xs font-mono uppercase tracking-widest inline-flex items-center justify-center gap-2 mt-6 disabled:opacity-50 font-bold shadow-md"
          >
            <span>{loginMutation.isPending ? 'Đang xác thực...' : 'Đăng Nhập Ngay'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

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
};
