import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ConversationStateStore,
  setConversationStoreForTests,
  getConversationStore,
} from '../conversationState.js';
import type { KeyValueStore } from '../redisClient.js';

function createMockStore(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    get: vi.fn(async (key: string) => data.get(key) ?? null),
    set: vi.fn(async (key: string, value: string) => { data.set(key, value); }),
    del: vi.fn(async (key: string) => { data.delete(key); }),
  };
}

describe('ConversationStateStore', () => {
  let mockStore: KeyValueStore;
  let store: ConversationStateStore;

  beforeEach(() => {
    mockStore = createMockStore();
    store = new ConversationStateStore(mockStore);
  });

  describe('order conversation', () => {
    const telegramId = '123456';
    const orderData = {
      step: 'flavor',
      userId: telegramId,
      contactName: 'Test User',
      contactPhone: '+251911111111',
      eventType: 'Birthday',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('stores and retrieves an order conversation', async () => {
      await store.setOrder(telegramId, orderData);
      const result = await store.getOrder(telegramId);
      expect(result).not.toBeNull();
      expect(result?.contactName).toBe('Test User');
      expect(result?.step).toBe('flavor');
      expect(result?.updatedAt).toBeDefined();
    });

    it('returns null for non-existent order', async () => {
      const result = await store.getOrder('999');
      expect(result).toBeNull();
    });

    it('clears an order conversation', async () => {
      await store.setOrder(telegramId, orderData);
      await store.clearOrder(telegramId);
      const result = await store.getOrder(telegramId);
      expect(result).toBeNull();
    });

    it('updates updatedAt on set', async () => {
      await store.setOrder(telegramId, orderData);
      const first = await store.getOrder(telegramId);
      const firstUpdated = first!.updatedAt;

      await new Promise(r => setTimeout(r, 10));
      await store.setOrder(telegramId, { ...orderData, step: 'designStyle' });
      const second = await store.getOrder(telegramId);
      expect(second!.updatedAt).not.toBe(firstUpdated);
      expect(second!.step).toBe('designStyle');
    });
  });

  describe('quote conversation', () => {
    const telegramId = '789012';
    const quoteData = {
      orderId: 'FB-ABC123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('stores and retrieves a quote conversation', async () => {
      await store.setQuote(telegramId, quoteData);
      const result = await store.getQuote(telegramId);
      expect(result).not.toBeNull();
      expect(result?.orderId).toBe('FB-ABC123');
    });

    it('returns null for non-existent quote', async () => {
      const result = await store.getQuote('999');
      expect(result).toBeNull();
    });

    it('clears a quote conversation', async () => {
      await store.setQuote(telegramId, quoteData);
      await store.clearQuote(telegramId);
      expect(await store.getQuote(telegramId)).toBeNull();
    });
  });

  describe('independence of order and quote', () => {
    it('order and quote keys do not interfere', async () => {
      await store.setOrder('user1', { step: 'done', userId: 'user1', contactName: 'A', contactPhone: '1', createdAt: '', updatedAt: '' });
      await store.setQuote('user1', { orderId: 'FB-1', createdAt: '', updatedAt: '' });
      const order = await store.getOrder('user1');
      const quote = await store.getQuote('user1');
      expect(order).not.toBeNull();
      expect(quote).not.toBeNull();
      expect(order?.step).toBe('done');
      expect(quote?.orderId).toBe('FB-1');
    });
  });
});

describe('getConversationStore', () => {
  it('returns a store singleton', () => {
    const store1 = getConversationStore();
    const store2 = getConversationStore();
    expect(store1).toBe(store2);
  });
});

describe('setConversationStoreForTests', () => {
  it('replaces the singleton', () => {
    const mock = new ConversationStateStore(createMockStore());
    setConversationStoreForTests(mock);
    expect(getConversationStore()).toBe(mock);
    setConversationStoreForTests(null);
    expect(getConversationStore()).not.toBe(mock);
  });
});

describe('ConversationStateStore — corrupted data resilience', () => {
  it('returns null and clears corrupted JSON for order', async () => {
    const delFn = vi.fn(async () => {});
    const corruptedStore: KeyValueStore = {
      get: vi.fn(async () => 'not-valid-json{{{'),
      set: vi.fn(async () => {}),
      del: delFn,
    };
    const store = new ConversationStateStore(corruptedStore);

    const result = await store.getOrder('user1');
    expect(result).toBeNull();
    // Corrupted entry should be cleaned up
    expect(delFn).toHaveBeenCalled();
  });

  it('returns null and clears corrupted JSON for quote', async () => {
    const delFn = vi.fn(async () => {});
    const corruptedStore: KeyValueStore = {
      get: vi.fn(async () => '{{invalid'),
      set: vi.fn(async () => {}),
      del: delFn,
    };
    const store = new ConversationStateStore(corruptedStore);

    const result = await store.getQuote('user1');
    expect(result).toBeNull();
    expect(delFn).toHaveBeenCalled();
  });

  it('returns null when Redis returns empty string', async () => {
    const emptyStore: KeyValueStore = {
      get: vi.fn(async () => ''),
      set: vi.fn(async () => {}),
      del: vi.fn(async () => {}),
    };
    const store = new ConversationStateStore(emptyStore);

    const result = await store.getOrder('user1');
    expect(result).toBeNull();
  });

  it('returns null when Redis returns null (key expired)', async () => {
    const nullStore: KeyValueStore = {
      get: vi.fn(async () => null),
      set: vi.fn(async () => {}),
      del: vi.fn(async () => {}),
    };
    const store = new ConversationStateStore(nullStore);

    const result = await store.getOrder('user1');
    expect(result).toBeNull();
  });
});
