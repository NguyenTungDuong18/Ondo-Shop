import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { type LoginValues, loginSchema } from '../../../../application/validation/loginSchema';
import type { LoginRequest } from '../../../../domain/models/auth';
import { useLoginMutation } from '../../../hooks/useAuthQueries';
export function useLoginPage() {

  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: '',
      password: '',
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
  return { loginMutation, register, handleSubmit, errors, onSubmit, inputStyle };
}
