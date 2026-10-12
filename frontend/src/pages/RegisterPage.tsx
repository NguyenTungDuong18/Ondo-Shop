import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useRegisterMutation } from '../hooks/useAuthQueries';
import type { RegisterRequest } from '../types/auth';
import { User, Mail, Lock, UserCheck, Phone, ArrowRight } from 'lucide-react';
import { ToastContainer } from '../components/common/ToastContainer';

const registerSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập tối thiểu 3 ký tự'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  fullName: z.string().min(2, 'Vui lòng nhập Họ và tên'),
  phoneNumber: z.string().optional(),
  role: z.string(),
});

type RegisterValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      fullName: '',
      phoneNumber: '',
      role: 'Customer',
    },
  });

  const onSubmit = (data: RegisterValues) => {
    registerMutation.mutate(data as RegisterRequest);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-100 dark:bg-[#111113] text-zinc-900 dark:text-zinc-100 relative overflow-hidden">
      {/* High Contrast Background Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-zinc-300/40 dark:bg-zinc-800/30 rounded-full blur-3xl pointer-events-none" />

      {/* High Contrast Auth Card */}
      <div className="bg-white dark:bg-[#1c1c20] w-full max-w-lg p-8 sm:p-10 rounded-3xl border-2 border-zinc-950 dark:border-zinc-700 shadow-2xl relative z-10 animate-fade-in my-8">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-3">
            <span className="font-serif-hero text-4xl text-zinc-950 dark:text-zinc-100 tracking-tight block">
              Onda.
            </span>
          </Link>
          <h2 className="font-serif italic text-2xl text-zinc-950 dark:text-zinc-100 font-semibold">Đăng Ký Tài Khoản</h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium mt-1 font-mono uppercase tracking-wider">Trở thành thành viên để trải nghiệm mua sắm Onda Studio</p>
        </div>

        <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-4">
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
        </form>

        <div className="text-center mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-zinc-950 dark:text-zinc-100 font-bold underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};
