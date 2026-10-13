import type { AuthRepository } from '../../domain/repositories/AuthRepository';

/** Application port; installed once by the composition root. */
let repository: AuthRepository | undefined;
export function configureAuthRepository(adapter: AuthRepository) { repository = adapter; }
function getRepository(): AuthRepository {
  if (!repository) throw new Error('Auth repository has not been configured');
  return repository;
}
export const createAuthUseCases = (adapter: AuthRepository): AuthRepository => ({
  register: (...args) => adapter.register(...args),
  login: (...args) => adapter.login(...args),
  sendOtp: (...args) => adapter.sendOtp(...args),
  verifyOtp: (...args) => adapter.verifyOtp(...args),
  refreshToken: (...args) => adapter.refreshToken(...args),
  logout: (...args) => adapter.logout(...args),
  updateProfile: (...args) => adapter.updateProfile(...args),
  getProfile: (...args) => adapter.getProfile(...args),
});
export const authService: AuthRepository = {
  register: (...args) => getRepository().register(...args),
  login: (...args) => getRepository().login(...args),
  sendOtp: (...args) => getRepository().sendOtp(...args),
  verifyOtp: (...args) => getRepository().verifyOtp(...args),
  refreshToken: (...args) => getRepository().refreshToken(...args),
  logout: (...args) => getRepository().logout(...args),
  updateProfile: (...args) => getRepository().updateProfile(...args),
  getProfile: (...args) => getRepository().getProfile(...args),
};
