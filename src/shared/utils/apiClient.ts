const TOKEN_KEY = 'flavourbites_token';

let authToken: string | null = (() => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
})();

export function setToken(token: string) {
  authToken = token;
  try { localStorage.setItem(TOKEN_KEY, token); } catch {}
}

export function clearToken() {
  authToken = null;
  try { localStorage.removeItem(TOKEN_KEY); } catch {}
}

let csrfToken: string | null = null;

export async function fetchCsrfToken() {
  try {
    const res = await fetch('/api/csrf-token', { credentials: 'same-origin' });
    const data = await res.json();
    if (data.token) csrfToken = data.token;
  } catch (err) {
    console.warn('[CSRF] Failed to fetch token', err);
  }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && !csrfToken) {
    await fetchCsrfToken();
  }

  return fetch(path, {
    ...options,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
      ...options.headers,
    },
  });
}
