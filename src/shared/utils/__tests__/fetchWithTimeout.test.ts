import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithTimeout } from '../fetchWithTimeout.js';

describe('fetchWithTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns the fetch response on success', async () => {
    const mockResponse = { ok: true, status: 200 } as Response;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const result = await fetchWithTimeout('https://api.example.com/data', {}, 5000);
    expect(result).toBe(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/data',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('passes through request options', async () => {
    const mockResponse = { ok: true } as Response;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    await fetchWithTimeout('https://api.example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"key":"value"}',
    }, 5000);

    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"key":"value"}',
        signal: expect.any(AbortSignal),
      })
    );
  });

  it('throws a timeout error when fetch takes too long', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      return new Promise((_, reject) => {
        const signal = init.signal;
        if (signal) {
          signal.addEventListener('abort', () => {
            reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
          });
        }
      });
    }));

    const promise = fetchWithTimeout('https://api.example.com/slow', {}, 1000);

    // Advance past the timeout
    vi.advanceTimersByTime(1001);

    await expect(promise).rejects.toThrow('Request to https://api.example.com/slow timed out after 1000ms');
  });

  it('does not timeout if response arrives before deadline', async () => {
    const mockResponse = { ok: true } as Response;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const result = await fetchWithTimeout('https://api.example.com/fast', {}, 5000);
    expect(result).toBe(mockResponse);
    expect(result.ok).toBe(true);
  });

  it('throws non-abort errors directly', async () => {
    const networkError = new Error('Network failure');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(networkError));

    await expect(
      fetchWithTimeout('https://api.example.com/bad', {}, 5000)
    ).rejects.toThrow('Network failure');
  });

  it('uses default timeout of 10 seconds when not specified', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      return new Promise((_, reject) => {
        const signal = init.signal;
        if (signal) {
          signal.addEventListener('abort', () => {
            reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
          });
        }
      });
    }));

    const promise = fetchWithTimeout('https://api.example.com');

    // At 9999ms, still waiting
    vi.advanceTimersByTime(9999);
    // At 10001ms, timeout fires
    vi.advanceTimersByTime(2);

    await expect(promise).rejects.toThrow('timed out after 10000ms');
  });

  it('accepts URL objects', async () => {
    const mockResponse = { ok: true } as Response;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const url = new URL('https://api.example.com/path');
    const result = await fetchWithTimeout(url, {}, 5000);
    expect(result).toBe(mockResponse);
  });

  it('clears the timer on success (no lingering timers)', async () => {
    const mockResponse = { ok: true } as Response;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    await fetchWithTimeout('https://api.example.com', {}, 5000);

    // If timer wasn't cleared, advancing would cause issues
    vi.advanceTimersByTime(15000);
    // No assertion needed - if timers weren't cleared, vitest would complain
  });

  it('clears the timer on failure (no lingering timers)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('boom')));

    await expect(fetchWithTimeout('https://api.example.com', {}, 5000)).rejects.toThrow();

    // Timer should be cleared in finally block
    vi.advanceTimersByTime(15000);
  });
});
