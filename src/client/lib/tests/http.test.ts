// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
  http,
  responseBody,
} from '@client/lib/http';
import { ApiError } from '@/shared/api';
import { setToken, clearToken } from '@client/lib/tokenStorage';

describe('http transport layer & interceptors', () => {
  let originalAdapter: any;

  beforeEach(() => {
    originalAdapter = http.defaults.adapter;
    clearToken();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    http.defaults.adapter = originalAdapter;
    clearToken();
    vi.unstubAllGlobals();
  });

  describe('request interceptor', () => {
    it('attaches Authorization Bearer header when token is present in tokenStorage', async () => {
      setToken('jwt_test_token');

      let capturedConfig: InternalAxiosRequestConfig | undefined;
      http.defaults.adapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
        capturedConfig = config;
        return {
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      };

      const response = await http.get('/api/test');
      expect(response.status).toBe(200);
      expect(capturedConfig?.headers.get('Authorization')).toBe('Bearer jwt_test_token');
    });

    it('omits Authorization header when token is not present in tokenStorage', async () => {
      clearToken();

      let capturedConfig: InternalAxiosRequestConfig | undefined;
      http.defaults.adapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
        capturedConfig = config;
        return {
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      };

      await http.get('/api/test');
      expect(capturedConfig?.headers.get('Authorization')).toBeUndefined();
    });

    it('fetches and attaches CSRF token on mutating requests using axios', async () => {
      const axiosGetSpy = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: { token: 'mock-csrf-token' },
      });

      let capturedConfig: InternalAxiosRequestConfig | undefined;
      http.defaults.adapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
        capturedConfig = config;
        return {
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      };

      await http.post('/api/orders', { cake: 'Velvet' });
      expect(axiosGetSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/csrf-token'),
        expect.objectContaining({ withCredentials: true })
      );
      expect(capturedConfig?.headers.get('x-csrf-token')).toBe('mock-csrf-token');
    });
  });

  describe('response interceptor and error normalization', () => {
    it('clears token on 401 Unauthorized response', async () => {
      setToken('token-to-clear');

      http.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
        const error: any = new Error('Unauthorized');
        error.response = {
          status: 401,
          data: { success: false, error: 'Session expired' },
          statusText: 'Unauthorized',
          headers: {},
          config,
        };
        throw error;
      };

      await expect(http.get('/api/protected')).rejects.toThrow('Session expired');
      expect(localStorage.getItem('flavourbites_token')).toBeNull();
    });

    it('normalizes server error messages into ApiError', async () => {
      http.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
        const error: any = new Error('Bad Request');
        error.response = {
          status: 400,
          data: { success: false, error: 'Custom error from backend', status: 400, code: 'VALIDATION_ERROR' },
          statusText: 'Bad Request',
          headers: {},
          config,
        };
        throw error;
      };

      try {
        await http.post('/api/submit', {});
        expect.unreachable('Should have thrown an error');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect((err as ApiError).message).toBe('Custom error from backend');
        expect((err as ApiError).status).toBe(400);
      }
    });

    it('normalizes timeout errors into readable ApiError', async () => {
      http.defaults.adapter = async (_config: InternalAxiosRequestConfig) => {
        const error: any = new Error('timeout of 15000ms exceeded');
        error.code = 'ECONNABORTED';
        throw error;
      };

      await expect(http.get('/api/slow')).rejects.toThrow('Request timed out');
    });
  });

  describe('responseBody helper', () => {
    it('returns typed response data', () => {
      const mockResponse: AxiosResponse = {
        data: { success: true, items: [1, 2, 3] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const result = responseBody<{ items: number[] }>(mockResponse);
      expect(result).toEqual({ success: true, items: [1, 2, 3] });
    });
  });
});
