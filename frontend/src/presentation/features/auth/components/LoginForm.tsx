import { ArrowRight, Lock, User } from 'lucide-react';
import type { useLoginPage } from '../hooks/useLoginPage';
type Props = {
  handleSubmit: NonNullable<ReturnType<typeof useLoginPage>>['handleSubmit'];
  onSubmit: NonNullable<ReturnType<typeof useLoginPage>>['onSubmit'];
  register: NonNullable<ReturnType<typeof useLoginPage>>['register'];
  inputStyle: NonNullable<ReturnType<typeof useLoginPage>>['inputStyle'];
  errors: NonNullable<ReturnType<typeof useLoginPage>>['errors'];
  loginMutation: NonNullable<ReturnType<typeof useLoginPage>>['loginMutation'];
};
export function LoginForm({ handleSubmit, onSubmit, register, inputStyle, errors, loginMutation }: Props) {
  return (<form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-5">
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
  </form>);
}
