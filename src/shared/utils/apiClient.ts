const TOKEN_KEY = 'flavourbites_token';
const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

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
    const res = await fetch(`${API_BASE}/api/csrf-token`, { credentials: 'include' });
    if (!res.ok) throw new Error(`CSRF token fetch failed: ${res.status}`);
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

  const fullPath = path.startsWith('/') ? `${API_BASE}${path}` : path;

  return fetch(fullPath, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
      ...options.headers,
    },
  });
}
