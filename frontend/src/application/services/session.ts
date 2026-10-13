import type { SessionRepository } from '../../domain/repositories/SessionRepository';
let repository: SessionRepository | undefined;
export function configureSessionRepository(adapter: SessionRepository) { repository = adapter; }
function getRepository() {
  if (!repository) throw new Error('Session repository has not been configured');
  return repository;
}
export const session: SessionRepository = {
  getToken: () => getRepository().getToken(),
  setToken: token => getRepository().setToken(token),
  clearToken: () => getRepository().clearToken(),
};
