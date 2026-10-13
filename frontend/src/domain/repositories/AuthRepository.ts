import type { ApiResponse } from '../models/api';
import type { AuthResultResponse, LoginRequest, LoginResponse, RegisterRequest, UpdateProfileRequest, UserResponse, VerifyOtpResponse } from '../models/auth';
export interface AuthRepository {
  register(data: RegisterRequest): Promise<ApiResponse<string>>;
  login(data: LoginRequest): Promise<ApiResponse<AuthResultResponse>>;
  sendOtp(data: { email: string }): Promise<ApiResponse<string>>;
  verifyOtp(data: { email: string; otpCode: string }): Promise<ApiResponse<VerifyOtpResponse>>;
  refreshToken(): Promise<ApiResponse<LoginResponse>>;
  logout(): Promise<ApiResponse<string>>;
  updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserResponse>>;
  getProfile(): Promise<ApiResponse<UserResponse>>;
}
