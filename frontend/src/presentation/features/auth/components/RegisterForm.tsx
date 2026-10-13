import { ArrowRight, Lock, Mail, Phone, User, UserCheck } from 'lucide-react';
import type { useRegisterPage } from '../hooks/useRegisterPage';
type Props = {
  handleSubmit: NonNullable<ReturnType<typeof useRegisterPage>>['handleSubmit'];
  onSubmit: NonNullable<ReturnType<typeof useRegisterPage>>['onSubmit'];
  register: NonNullable<ReturnType<typeof useRegisterPage>>['register'];
  errors: NonNullable<ReturnType<typeof useRegisterPage>>['errors'];
  registerMutation: NonNullable<ReturnType<typeof useRegisterPage>>['registerMutation'];
};
export function RegisterForm({ handleSubmit, onSubmit, register, errors, registerMutation }: Props) {
  return (<form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-mono font-bold text-zinc-950 dark:text-zinc-100 mb-1.5 uppercase tracking-wider">Tên đăng nhập *</label>
        <div className="relative">
          <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            {...register('username')}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-[#27272a] border-2 border-zinc-300 dark:border-zinc-600 rounded-xl text-xs font-sans text-zinc-950 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:bg-white dark:focus:bg-[#27272a] focus:border-zinc-950 dark:focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 dark:focus:ring-zinc-400/10 transition-all font-medium"
            placeholder="johndoe"
          />
        </div>
        {errors.username && <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1">{errors.username.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-mono font-bold text-zinc-950 dark:text-zinc-100 mb-1.5 uppercase tracking-wider">Họ và tên *</label>
        <div className="relative">
          <UserCheck className="w-4 h-4 text-zinc-500 dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            {...register('fullName')}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-[#27272a] border-2 border-zinc-300 dark:border-zinc-600 rounded-xl text-xs font-sans text-zinc-950 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:bg-white dark:focus:bg-[#27272a] focus:border-zinc-950 dark:focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 dark:focus:ring-zinc-400/10 transition-all font-medium"
            placeholder="Nguyễn Văn A"
          />
        </div>
        {errors.fullName && <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1">{errors.fullName.message}</p>}
      </div>
    </div>

    <div>
      <label className="block text-xs font-mono font-bold text-zinc-950 dark:text-zinc-100 mb-1.5 uppercase tracking-wider">Địa chỉ Email *</label>
      <div className="relative">
        <Mail className="w-4 h-4 text-zinc-500 dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="email"
          {...register('email')}
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-[#27272a] border-2 border-zinc-300 dark:border-zinc-600 rounded-xl text-xs font-sans text-zinc-950 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:bg-white dark:focus:bg-[#27272a] focus:border-zinc-950 dark:focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 dark:focus:ring-zinc-400/10 transition-all font-medium"
          placeholder="user@system.com"
        />
      </div>
      {errors.email && <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1">{errors.email.message}</p>}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-mono font-bold text-zinc-950 dark:text-zinc-100 mb-1.5 uppercase tracking-wider">Mật khẩu *</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-zinc-500 dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            {...register('password')}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-[#27272a] border-2 border-zinc-300 dark:border-zinc-600 rounded-xl text-xs font-sans text-zinc-950 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:bg-white dark:focus:bg-[#27272a] focus:border-zinc-950 dark:focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 dark:focus:ring-zinc-400/10 transition-all font-medium"
            placeholder="••••••••"
          />
        </div>
        {errors.password && <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-mono font-bold text-zinc-950 dark:text-zinc-100 mb-1.5 uppercase tracking-wider">Số điện thoại</label>
        <div className="relative">
          <Phone className="w-4 h-4 text-zinc-500 dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="tel"
            {...register('phoneNumber')}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-[#27272a] border-2 border-zinc-300 dark:border-zinc-600 rounded-xl text-xs font-sans text-zinc-950 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:bg-white dark:focus:bg-[#27272a] focus:border-zinc-950 dark:focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 dark:focus:ring-zinc-400/10 transition-all font-medium"
            placeholder="0912 345 678"
          />
        </div>
      </div>
    </div>

    <div>
      <label className="block text-xs font-mono font-bold text-zinc-950 dark:text-zinc-100 mb-1.5 uppercase tracking-wider">Loại tài khoản</label>
      <select
        {...register('role')}
        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#27272a] border-2 border-zinc-300 dark:border-zinc-600 rounded-xl text-xs font-mono font-semibold text-zinc-950 dark:text-zinc-100 focus:bg-white dark:focus:bg-[#27272a] focus:border-zinc-950 dark:focus:border-zinc-400 focus:outline-none cursor-pointer"
      >
        <option value="Customer">Thành viên (Customer)</option>
        <option value="Admin">Quản trị viên (Administrator)</option>
      </select>
    </div>

    {/* Submit Button with Color Inversion Light Beam Sweep Effect */}
    <button
      type="submit"
      disabled={registerMutation.isPending}
      className="btn-spotlight-sweep w-full py-3.5 text-xs font-mono uppercase tracking-widest inline-flex items-center justify-center gap-2 mt-6 disabled:opacity-50 font-bold shadow-md"
    >
      <span>{registerMutation.isPending ? 'Đang khởi tạo...' : 'Hoàn Tất Đăng Ký'}</span>
      <ArrowRight className="w-4 h-4" />
    </button>
  </form>);
}
