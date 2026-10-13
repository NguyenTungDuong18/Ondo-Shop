import axios, { type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../../shared/config/environment';
import { createTokenRefresher } from '../auth/createTokenRefresher';
import { isTokenExpiringSoon } from '../auth/jwt';
import { sessionRepository } from '../auth/sessionRepository';
import { extractErrorMessage } from './errors';
export const axiosClient = axios.create({ baseURL: API_BASE_URL, withCredentials: true, headers: { 'Content-Type': 'application/json' } });
const publicEndpoints = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/send-otp', '/api/v1/auth/verify-otp', '/api/v1/auth/refresh-token', '/api/v1/auth/resend-email'];
const isPublicEndpoint = (url = '') => publicEndpoints.some(endpoint => url.split('?')[0] === endpoint);
const refreshToken = createTokenRefresher(async () => {
  const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh-token`, {}, { withCredentials: true, timeout: 10000 });
  return response.data?.data?.token;
}, sessionRepository);
axiosClient.interceptors.request.use(async config => {
  if (isPublicEndpoint(config.url)) { delete config.headers.Authorization; return config; }
  const token = sessionRepository.getToken();
  if (token && isTokenExpiringSoon(token, 30 * 60)) {
    try { await refreshToken(); } catch { /* The protected request will surface an authentication failure. */ }
  }
  const currentToken = sessionRepository.getToken();
  if (currentToken) config.headers.Authorization = `Bearer ${currentToken}`;
  return config;
});
axiosClient.interceptors.response.use(response => response, async error => {
  const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
  if (original && !isPublicEndpoint(original.url) && error.response?.status === 401 && !original._retry) {
    original._retry = true;
    try { const token = await refreshToken(); original.headers.Authorization = `Bearer ${token}`; return axiosClient(original); } catch { /* Normalize the original error below. */ }
  }
  if (error.response?.status === 401 && original && !isPublicEndpoint(original.url)) sessionRepository.clearToken();
  if (error.response?.data) return Promise.reject(new Error(extractErrorMessage(error.response.data)));
  if (error.request && !error.response) return Promise.reject(new Error(`Unable to connect to Backend service (${API_BASE_URL}). Please verify the server.`));
  return Promise.reject(error);
});
export default axiosClient;
