const TOKEN_KEY = 'flavourbites_token';

let authToken: string | null = (() => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
})();

export function setToken(t: string) {
  authToken = t;
  try { localStorage.setItem(TOKEN_KEY, t); } catch {}
}

export function clearToken() {
  authToken = null;
  try { localStorage.removeItem(TOKEN_KEY); } catch {}
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(path, {
    ...options,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers ?? {}),
    },
  });
}
