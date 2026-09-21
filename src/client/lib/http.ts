import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { clearToken, getToken } from './tokenStorage';
import { env } from '../platform/config/env';
import { ApiError, type ApiResponse } from '../../shared/api/types';

const API_BASE = env.VITE_API_URL;

let csrfToken: string | null = null;

async function getCsrfToken(): Promise<string | null> {
  if (csrfToken) return csrfToken;
  try {
    const { data } = await axios.get<{ token: string }>(`${API_BASE}/api/csrf-token`, {
      withCredentials: true,
      timeout: 5000,
    });
    if (data?.token) {
      csrfToken = data.token;
    }
  } catch (err) {
    console.warn('[CSRF] Failed to fetch token', err);
  }
  return csrfToken;
}

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
  withCredentials: true,
});

http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const method = (config.method || 'GET').toUpperCase();
  if (!SAFE_METHODS.includes(method)) {
    const token = await getCsrfToken();
    if (token) {
      config.headers.set('x-csrf-token', token);
    }
  }

  const authToken = getToken();
  if (authToken) {
    config.headers.set('Authorization', `Bearer ${authToken}`);
  }

  return config;
});

http.interceptors.response.use(
  (response) => {
    const contentType = response.headers?.['content-type'];
    if (
      typeof response.data === 'string' &&
      typeof contentType === 'string' &&
      contentType.includes('text/html')
    ) {
      throw new ApiError(
        'Backend unreachable: received HTML instead of JSON. Check that VITE_API_URL is configured.',
        response.status
      );
    }
    return response;
  },
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const status = error.response?.status;
    if (status === 401) {
      clearToken();
    }

    const serverMessage = error.response?.data?.error || error.response?.data?.message;
    let message: string;
    if (typeof serverMessage === 'string' && serverMessage) {
      message = serverMessage;
    } else if (error.code === 'ECONNABORTED') {
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

/**
 * Type-safe GET that unwraps the `{ success, ... }` envelope: resolves with the
 * success payload or throws an ApiError. The building block for TanStack Query
 * queryFn's — callers never re-check `data.success`.
 */
export async function apiGet<T>(
  path: string,
  config?: AxiosRequestConfig,
): Promise<Extract<ApiResponse<T>, { success: true }>> {
  const { data } = await http.get<ApiResponse<T>>(path, config);
  if (!data.success) {
    throw new ApiError(data.error || 'Request failed');
  }
  return data;
}