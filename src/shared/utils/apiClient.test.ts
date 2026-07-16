// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { setToken, clearToken, apiFetch } from './apiClient';

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
  it('adds Authorization header when token is set', async () => {
    setToken('test-token-123');
    const mock = vi.fn(() => new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', mock);

    await apiFetch('/api/test');

    const call = mock.mock.calls[0];
    expect(call[0]).toBe('/api/test');
    expect(call[1].headers.Authorization).toBe('Bearer test-token-123');
  });

  it('omits Authorization when token is not set', async () => {
    const mock = vi.fn(() => new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', mock);

    await apiFetch('/api/test');

    const headers = mock.mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
  });

  it('merges custom headers', async () => {
    setToken('tok');
    const mock = vi.fn(() => new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', mock);

    await apiFetch('/api/test', { headers: { 'X-Custom': 'val' } });

    const headers = mock.mock.calls[0][1].headers;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers.Authorization).toBe('Bearer tok');
    expect(headers['X-Custom']).toBe('val');
  });

  it('forwards options like method and body', async () => {
    setToken('tok');
    const mock = vi.fn(() => new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', mock);

    await apiFetch('/api/data', { method: 'POST', body: '{"x":1}' });

    const call = mock.mock.calls[0][1];
    expect(call.method).toBe('POST');
    expect(call.body).toBe('{"x":1}');
  });
});
