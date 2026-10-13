import { z } from 'zod';
export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Vui lòng nhập Username hoặc Email'),
  password: z.string().min(1, 'Vui lòng nhập Mật khẩu'),
});
export type LoginValues = z.infer<typeof loginSchema>;
