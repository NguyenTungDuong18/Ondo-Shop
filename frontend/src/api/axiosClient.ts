import axios, { type InternalAxiosRequestConfig } from 'axios';
import { isTokenExpiringSoon } from '../store/authStore';

export const API_BASE_URL = 'http://localhost:5000';

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function processRefreshQueue(token: string) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

// Endpoints KHÔNG cần auth — skip token attach & refresh
const PUBLIC_ENDPOINTS = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/send-otp',
  '/api/v1/auth/verify-otp',
  '/api/v1/auth/refresh-token',
  '/api/v1/auth/resend-email',
];

function isPublicEndpoint(url: string): boolean {
  return PUBLIC_ENDPOINTS.some((ep) => url.includes(ep));
}

/**
 * Trích xuất thông báo lỗi tiếng Việt cụ thể từ response backend,
 * tránh trả về các từ tiếng Anh chung chung như "Unauthorized", "Bad Request".
 */
export function extractErrorMessage(data: any): string {
  if (!data) return 'An unknown error occurred. Please try again later.';

  // 1. Prioritize detailed error description
  if (typeof data.detail === 'string' && data.detail.trim()) {
    return data.detail.trim();
  }

  // 2. Extract message property
  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message.trim();
  }

  // 3. Validation errors array/object
  if (data.errors && typeof data.errors === 'object') {
    const messages: string[] = [];
    Object.entries(data.errors).forEach(([_, val]) => {
      if (Array.isArray(val)) {
        val.forEach((m) => messages.push(String(m)));
      } else if (typeof val === 'string') {
        messages.push(val);
      }
    });
    if (messages.length > 0) {
      return messages.join(' · ');
    }
  }

  // 4. Custom title if not generic English default
  if (typeof data.title === 'string' && data.title.trim()) {
    const title = data.title.trim();
    const genericWords = ['unauthorized', 'bad request', 'not found', 'forbidden', 'internal server error', 'one or more validation errors occurred.'];
    if (!genericWords.includes(title.toLowerCase())) {
      return title;
    }
  }

  return 'Operation failed. Please verify your details and try again.';
}

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip token header for public/auth endpoints (Login, Register, Verify OTP...)
    if (isPublicEndpoint(config.url || '')) {
      if (config.headers) {
        delete config.headers.Authorization;
      }
      return config;
    }

    const token = localStorage.getItem('token');
    if (token) {
      // Proactive refresh: if token expiring within 30 min, refresh first
      if (isTokenExpiringSoon(token, 30 * 60)) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const res = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh-token`, {}, { withCredentials: true });
            const newToken = res.data?.data?.token;
            if (newToken) {
              localStorage.setItem('token', newToken);
              processRefreshQueue(newToken);
            }
          } catch {
            localStorage.removeItem('token');
          } finally {
            isRefreshing = false;
          }
        } else {
          await new Promise<string>((resolve) => {
            refreshQueue.push(resolve);
          });
        }
      }

      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Bỏ qua logic refresh đối với các endpoint public/auth
    if (isPublicEndpoint(originalRequest.url || '')) {
      if (error.response?.data) {
        const errorMsg = extractErrorMessage(error.response.data);
        return Promise.reject(new Error(errorMsg));
      }
      return Promise.reject(error);
    }

    // Xử lý tự động làm mới token khi gặp lỗi 401 trên protected endpoints
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const res = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh-token`, {}, { withCredentials: true });
          const newToken = res.data?.data?.token;
          if (newToken) {
            localStorage.setItem('token', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            processRefreshQueue(newToken);
            return axiosClient(originalRequest);
          }
        } catch {
          // Token refresh thất bại -> xóa token hết hạn
          localStorage.removeItem('token');
        } finally {
          isRefreshing = false;
        }
      } else {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosClient(originalRequest));
          });
          setTimeout(() => reject(new Error('Refresh timeout')), 10000);
        });
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }

    if (error.response?.data) {
      const errorMsg = extractErrorMessage(error.response.data);
      return Promise.reject(new Error(errorMsg));
    }

    if (error.request) {
      return Promise.reject(new Error('Unable to connect to Backend service (http://localhost:5000). Please verify the server.'));
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
