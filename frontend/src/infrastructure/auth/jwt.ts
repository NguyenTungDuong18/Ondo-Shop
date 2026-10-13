// JWT decode helper
export function decodeJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ?? null;
  } catch {
    return null;
  }
}

// Check if token is expiring within N seconds
export function isTokenExpiringSoon(token: string, withinSeconds: number = 30 * 60): boolean {
  const exp = decodeJwtExp(token);
  if (exp == null) return true;
  return exp - Math.floor(Date.now() / 1000) < withinSeconds;
}
