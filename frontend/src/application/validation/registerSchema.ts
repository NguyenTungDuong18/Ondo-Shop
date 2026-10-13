import { z } from 'zod';
export const registerSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập tối thiểu 3 ký tự'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  fullName: z.string().min(2, 'Vui lòng nhập Họ và tên'),
  phoneNumber: z.string().optional(),
  role: z.string(),
});
export type RegisterValues = z.infer<typeof registerSchema>;
