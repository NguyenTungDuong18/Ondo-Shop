import type { SessionRepository } from '../../domain/repositories/SessionRepository';
export function createTokenRefresher(fetchToken: () => Promise<string>, session: SessionRepository) {
  let pending: Promise<string> | null = null;
  return function refreshToken(): Promise<string> {
    if (!pending) {
      pending = Promise.resolve().then(fetchToken).then(token => {
        if (!token) throw new Error('Refresh response did not contain a token');
        session.setToken(token); return token;
      }).catch(error => { session.clearToken(); throw error; }).finally(() => { pending = null; });
    }
    return pending;
  };
}
