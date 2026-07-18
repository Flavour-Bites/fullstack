// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setToken, clearToken, apiFetch } from '../apiClient';

afterEach(() => {
  vi.unstubAllGlobals();
  clearToken();
});

describe('setToken / clearToken', () => {
  it('can be called without errors', () => {
    setToken('abc');
    clearToken();
  });
});

describe('apiFetch', () => {
  let mock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mock = vi.fn((_url: string, _init?: RequestInit) => new Response(null, { status: 200 }));
  });

  it('adds Authorization header when token is set', async () => {
    setToken('test-token-123');
    vi.stubGlobal('fetch', mock);

    await apiFetch('/api/test');

    expect(mock).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer test-token-123' }),
    }));
  });

  it('omits Authorization when token is not set', async () => {
    vi.stubGlobal('fetch', mock);

    await apiFetch('/api/test');

    const headers = (mock.mock.calls[0] as [string, RequestInit])[1].headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it('merges custom headers', async () => {
    setToken('tok');
    vi.stubGlobal('fetch', mock);

    await apiFetch('/api/test', { headers: { 'X-Custom': 'val' } });

    const headers = (mock.mock.calls[0] as [string, RequestInit])[1].headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers.Authorization).toBe('Bearer tok');
    expect(headers['X-Custom']).toBe('val');
  });

  it('forwards options like method and body', async () => {
    setToken('tok');
    vi.stubGlobal('fetch', mock);

    await apiFetch('/api/data', { method: 'POST', body: '{"x":1}' });

    const opts = (mock.mock.calls[0] as [string, RequestInit])[1];
    expect(opts.method).toBe('POST');
    expect(opts.body).toBe('{"x":1}');
  });
});
