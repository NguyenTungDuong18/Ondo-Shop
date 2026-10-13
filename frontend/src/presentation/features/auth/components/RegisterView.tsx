import { Link } from 'react-router-dom';
import { ToastContainer } from '../../../shared/components/ToastContainer';
import type { useRegisterPage } from '../hooks/useRegisterPage';
import { RegisterForm } from './RegisterForm';
export function RegisterView({ model }: { model: ReturnType<typeof useRegisterPage> }) {
  if (!model) return null;
  const { registerMutation, register, handleSubmit, errors, onSubmit } = model;

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

        <RegisterForm handleSubmit={handleSubmit} onSubmit={onSubmit} register={register} errors={errors} registerMutation={registerMutation} />

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

}
