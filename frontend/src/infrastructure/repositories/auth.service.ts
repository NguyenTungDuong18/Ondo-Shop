import type { ApiResponse } from '../../domain/models/api';
import type { AuthResultResponse, LoginRequest, LoginResponse, RegisterRequest, UpdateProfileRequest, UserResponse, VerifyOtpResponse } from '../../domain/models/auth';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';

import axiosClient from '../http/axiosClient';

export const authRepository: AuthRepository = {
  async register(data: RegisterRequest): Promise<ApiResponse<string>> {
    const response = await axiosClient.post<ApiResponse<string>>('/api/v1/auth/register', data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<ApiResponse<AuthResultResponse>> {
    const response = await axiosClient.post<ApiResponse<AuthResultResponse>>('/api/v1/auth/login', data);
    return response.data;
  },

  async sendOtp(data: { email: string }): Promise<ApiResponse<string>> {
    const response = await axiosClient.post<ApiResponse<string>>('/api/v1/auth/send-otp', data);
    return response.data;
  },

  async verifyOtp(data: { email: string; otpCode: string }): Promise<ApiResponse<VerifyOtpResponse>> {
    const response = await axiosClient.post<ApiResponse<VerifyOtpResponse>>('/api/v1/auth/verify-otp', data);
    return response.data;
  },

  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    const response = await axiosClient.post<ApiResponse<LoginResponse>>('/api/v1/auth/refresh-token');
    return response.data;
  },

  async logout(): Promise<ApiResponse<string>> {
    const response = await axiosClient.post<ApiResponse<string>>('/api/v1/auth/logout');
    return response.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserResponse>> {
    const response = await axiosClient.put<ApiResponse<UserResponse>>('/api/v1/auth/me', data);
    return response.data;
  },

  async getProfile(): Promise<ApiResponse<UserResponse>> {
    const response = await axiosClient.get<ApiResponse<UserResponse>>('/api/v1/auth/me');
    return response.data;
  },
};
