export interface SessionRepository {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
}
