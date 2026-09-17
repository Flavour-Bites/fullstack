const TOKEN_KEY = 'flavourbites_token';

let token: string | null = (() => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
})();

export function getToken(): string | null {
  return token;
}

export function setToken(value: string): void {
  token = value;
  try {
    localStorage.setItem(TOKEN_KEY, value);
  } catch {
    // Storage may be unavailable
  }
}

export function clearToken(): void {
  token = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage may be unavailable
  }
}
