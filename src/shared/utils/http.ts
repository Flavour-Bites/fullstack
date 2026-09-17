import axios, { AxiosResponse } from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

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

async function fetchCsrfToken() {
  try {
    const res = await fetch(`${API_BASE}/api/csrf-token`, { credentials: 'include' });
    if (!res.ok) throw new Error(`CSRF token fetch failed: ${res.status}`);
    const data = await res.json();
    if (data.token) csrfToken = data.token;
  } catch (err) {
    console.warn('[CSRF] Failed to fetch token', err);
  }
}

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export type ApiResponse<T = Record<string, never>> =
  | ({ success: true; error?: string } & T)
  | { success: false; error: string };

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: true,
});

http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const method = (config.method || 'GET').toUpperCase();
  if (!SAFE_METHODS.includes(method) && !csrfToken) {
    await fetchCsrfToken();
  }

  if (authToken) config.headers.set('Authorization', `Bearer ${authToken}`);
  if (csrfToken) config.headers.set('x-csrf-token', csrfToken);
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const status = error.response?.status;
    if (status === 401) clearToken();

    const serverMessage = error.response?.data?.error || error.response?.data?.message;
    let message: string;
    if (typeof serverMessage === 'string' && serverMessage) {
      message = serverMessage;
    } else if ((error as AxiosError).code === 'ECONNABORTED') {
      message = 'Request timed out';
    } else {
      message = error.message || 'Network request failed';
    }
    return Promise.reject(new ApiError(message, status));
  }
);

export function responseBody<T>(response: AxiosResponse): ApiResponse<T> {
  return response.data as ApiResponse<T>;
}