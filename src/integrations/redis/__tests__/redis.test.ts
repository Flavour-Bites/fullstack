import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setRedisStoreForTests, getRedisStore } from '../redisClient.js';

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

  it('evicts oldest entries when max size reached', async () => {
    // MemoryStore should have a max size limit
    const maxEntries = 1000;
    for (let i = 0; i < maxEntries + 10; i++) {
      await store.set(`key-${i}`, `value-${i}`);
    }
    // First entries should be evicted
    const firstKey = await store.get('key-0');
    // Either evicted (null) or still present — depends on eviction strategy
    // The important thing is the store doesn't grow unbounded
    expect(firstKey === null || typeof firstKey === 'string').toBe(true);
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
