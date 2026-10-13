export interface UserResponse {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
}

export interface LoginResponse {
  user: UserResponse;
  token: string;
  refreshToken: string;
  expiresAt: string;
}
export interface VerifyOtpResponse {
  user: UserResponse;
  token: string;
  refreshToken: string;
  expiresAt: string;
}
export interface AuthResultResponse {
  requiresEmailVerification: boolean;
  email: string | null;
  loginData: LoginResponse | null;
}
