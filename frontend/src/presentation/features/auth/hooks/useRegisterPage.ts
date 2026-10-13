import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { type RegisterValues, registerSchema } from '../../../../application/validation/registerSchema';
import type { RegisterRequest } from '../../../../domain/models/auth';
import { useRegisterMutation } from '../../../hooks/useAuthQueries';
export function useRegisterPage() {

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
  return { registerMutation, register, handleSubmit, errors, onSubmit };
}
