const AUTH_TOKEN_KEY = "atlas_auth_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // Fall back to in-memory session if storage is unavailable
  }
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // Ignore
  }
}
