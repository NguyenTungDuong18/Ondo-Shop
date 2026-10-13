import type { SessionRepository } from '../../domain/repositories/SessionRepository';
export const sessionRepository: SessionRepository = {
  getToken: () => localStorage.getItem('token'),
  setToken: token => localStorage.setItem('token', token),
  clearToken: () => localStorage.removeItem('token'),
};
