import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setRedisStoreForTests, getRedisStore } from '../redisClient.js';

const MEMORY_STORE_MAX_ENTRIES = 10_000;

describe('MemoryStore', () => {
  let store: ReturnType<typeof getRedisStore>;

  beforeEach(() => {
    setRedisStoreForTests(null);
    store = getRedisStore();
  });

  it('sets and gets a value', async () => {
    await store.set('key1', 'value1');
    expect(await store.get('key1')).toBe('value1');
  });

  it('returns null for missing key', async () => {
    expect(await store.get('nonexistent')).toBeNull();
  });

  it('deletes a key', async () => {
    await store.set('key2', 'value2');
    await store.del('key2');
    expect(await store.get('key2')).toBeNull();
  });

  it('respects TTL expiration', async () => {
    vi.useFakeTimers();
    await store.set('temp', 'temp-value', 1);
    expect(await store.get('temp')).toBe('temp-value');
    vi.advanceTimersByTime(1500);
    expect(await store.get('temp')).toBeNull();
    vi.useRealTimers();
  });

  it('stores without TTL indefinitely', async () => {
    await store.set('perm', 'permanent');
    expect(await store.get('perm')).toBe('permanent');
    await store.set('perm', 'updated');
    expect(await store.get('perm')).toBe('updated');
  });

  it('handles multiple keys independently', async () => {
    await store.set('a', '1');
    await store.set('b', '2');
    expect(await store.get('a')).toBe('1');
    expect(await store.get('b')).toBe('2');
    await store.del('a');
    expect(await store.get('a')).toBeNull();
    expect(await store.get('b')).toBe('2');
  });

  it('evicts expired entries before over-limit entries', async () => {
    vi.useFakeTimers();
    // Fill to capacity with some expiring entries
    for (let i = 0; i < 50; i++) {
      await store.set(`exp-${i}`, `val-${i}`, 1);
    }
    // Advance past expiry
    vi.advanceTimersByTime(1500);

    // These new entries should succeed by evicting expired entries first
    for (let i = 0; i < 50; i++) {
      await store.set(`new-${i}`, `new-val-${i}`);
    }

    // New entries should exist
    expect(await store.get('new-0')).toBe('new-val-0');
    // Old expired entries should be gone
    expect(await store.get('exp-0')).toBeNull();
    vi.useRealTimers();
  });

  it('cleans up expired entries proactively', async () => {
    vi.useFakeTimers();
    await store.set('expire1', 'val1', 1);
    await store.set('expire2', 'val2', 1);
    await store.set('permanent', 'val3');

    vi.advanceTimersByTime(1500);

    // Expired entries should be cleaned up on access
    expect(await store.get('expire1')).toBeNull();
    expect(await store.get('expire2')).toBeNull();
    expect(await store.get('permanent')).toBe('val3');
    vi.useRealTimers();
  });
});

describe('getRedisStore / setRedisStoreForTests', () => {
  it('getRedisStore returns a store without error', () => {
    const s = getRedisStore();
    expect(s).toBeDefined();
    expect(typeof s.get).toBe('function');
    expect(typeof s.set).toBe('function');
    expect(typeof s.del).toBe('function');
  });

  it('setRedisStoreForTests replaces the singleton', async () => {
    const mockStore = {
      get: vi.fn().mockResolvedValue('mock-val'),
      set: vi.fn().mockResolvedValue(undefined),
      del: vi.fn().mockResolvedValue(undefined),
    };
    setRedisStoreForTests(mockStore as any);
    const s = getRedisStore();
    expect(await s.get('x')).toBe('mock-val');
    await s.set('x', 'y');
    expect(mockStore.set).toHaveBeenCalledWith('x', 'y');
  });

  it('setRedisStoreForTests(null) resets to default', () => {
    setRedisStoreForTests(null);
    const s = getRedisStore();
    expect(s).toBeDefined();
  });
});

describe('getRedisStore fallback warning', () => {
  it('logs warning when REDIS_URL is not set', () => {
    setRedisStoreForTests(null);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Reset so getRedisStore creates a new instance
    setRedisStoreForTests(null);
    getRedisStore();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('REDIS_URL not set')
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('in-memory store')
    );
    warnSpy.mockRestore();
  });

  it('does not log warning when REDIS_URL is set', () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    setRedisStoreForTests(null);
    getRedisStore();

    const redisWarnings = warnSpy.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].includes('REDIS_URL not set')
    );
    expect(redisWarnings).toHaveLength(0);
    warnSpy.mockRestore();
    delete process.env.REDIS_URL;
  });
});

describe('MemoryStore eviction boundary', () => {
  it('evicts 10% of entries when at capacity', async () => {
    setRedisStoreForTests(null);
    const store = getRedisStore();

    // Fill to max capacity (10,000 entries)
    for (let i = 0; i < MEMORY_STORE_MAX_ENTRIES; i++) {
      await store.set(`key-${i}`, `value-${i}`);
    }

    // Adding one more should trigger eviction
    await store.set('trigger-eviction', 'trigger-value');

    // The new key should exist
    expect(await store.get('trigger-eviction')).toBe('trigger-value');

    // ~1000 earliest keys should be evicted (10% of 10K)
    // key-0 through key-999 should be gone
    expect(await store.get('key-0')).toBeNull();
    expect(await store.get('key-999')).toBeNull();
    // key-1000 should still exist (beyond the 10% eviction window)
    expect(await store.get('key-1000')).toBe('value-1000');
  });
});

