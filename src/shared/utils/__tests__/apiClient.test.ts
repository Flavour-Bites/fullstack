import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setToken, clearToken, apiFetch } from '../apiClient.js';

describe('apiClient', () => {
  beforeEach(() => {
    clearToken();
  });

  describe('setToken / clearToken', () => {
    it('setToken stores a token', async () => {
      setToken('my-test-token');
      global.fetch = vi.fn().mockResolvedValue({ ok: true });
      await apiFetch('/test');
      const call = (global.fetch as any).mock.calls[0];
      expect(call[1].headers.Authorization).toBe('Bearer my-test-token');
    });

    it('clearToken removes the stored token', async () => {
      setToken('temp-token');
      clearToken();
      global.fetch = vi.fn().mockResolvedValue({ ok: true });
      await apiFetch('/test');
      const call = (global.fetch as any).mock.calls[0];
      expect(call[1].headers.Authorization).toBeUndefined();
    });
  });

  describe('apiFetch', () => {
    it('sends a fetch request with JSON headers', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({ success: true }) });
      const res = await apiFetch('/api/test');
      expect(res.ok).toBe(true);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it('includes bearer token when set', async () => {
      setToken('secret-token');
      global.fetch = vi.fn().mockResolvedValue({ ok: true });
      await apiFetch('/api/protected');
      const call = (global.fetch as any).mock.calls[0];
      expect(call[0]).toBe('/api/protected');
      expect(call[1].headers['Content-Type']).toBe('application/json');
      expect(call[1].headers.Authorization).toBe('Bearer secret-token');
    });

    it('merges additional headers', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true });
      await apiFetch('/api/test', { headers: { 'X-Custom': 'value' } });
      const call = (global.fetch as any).mock.calls[0];
      expect(call[1].headers['Content-Type']).toBe('application/json');
      expect(call[1].headers['X-Custom']).toBe('value');
    });

    it('passes through other options like method, body', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true });
      const body = JSON.stringify({ name: 'test' });
      await apiFetch('/api/submit', { method: 'POST', body });
      const call = (global.fetch as any).mock.calls[0];
      expect(call[1].method).toBe('POST');
      expect(call[1].body).toBe(body);
    });
  });
});
