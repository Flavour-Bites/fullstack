import { getRedisStore, type KeyValueStore } from './redisClient.js';
import { env } from '../../config/env';

export interface OrderConversation {
  step: string;
  userId: string;
  contactName: string;
  contactPhone: string;
  eventType?: string;
  eventDate?: string;
  guestCount?: number;
  flavor?: string;
  designStyle?: string;
  tierCount?: number;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceConversation {
  orderId: string;
  createdAt: string;
  updatedAt: string;
}

const ORDER_TTL_SECONDS = env.REDIS_CONVERSATION_TTL_SECONDS;
const PRICE_TTL_SECONDS = env.REDIS_PRICE_TTL_SECONDS;

const orderKey = (telegramId: string) => `fb:conversation:order:${telegramId}`;
const priceKey = (telegramId: string) => `fb:conversation:price:${telegramId}`;

function stamp<T extends object>(value: T): T & { updatedAt: string } {
  return { ...value, updatedAt: new Date().toISOString() };
}

export class ConversationStateStore {
  constructor(private store: KeyValueStore = getRedisStore()) {}

  async getOrder(telegramId: string) {
    const raw = await this.store.get(orderKey(telegramId));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as OrderConversation;
    } catch {
      await this.store.del(orderKey(telegramId));
      return null;
    }
  }

  async setOrder(telegramId: string, conversation: OrderConversation) {
    await this.store.set(orderKey(telegramId), JSON.stringify(stamp(conversation)), ORDER_TTL_SECONDS);
  }

  async clearOrder(telegramId: string) {
    await this.store.del(orderKey(telegramId));
  }

  async getPrice(telegramId: string) {
    const raw = await this.store.get(priceKey(telegramId));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PriceConversation;
    } catch {
      await this.store.del(priceKey(telegramId));
      return null;
    }
  }

  async setPrice(telegramId: string, price: PriceConversation) {
    await this.store.set(priceKey(telegramId), JSON.stringify(stamp(price)), PRICE_TTL_SECONDS);
  }

  async clearPrice(telegramId: string) {
    await this.store.del(priceKey(telegramId));
  }
}

let conversationStore: ConversationStateStore | null = null;

export function getConversationStore() {
  if (!conversationStore) conversationStore = new ConversationStateStore();
  return conversationStore;
}

export function setConversationStoreForTests(store: ConversationStateStore | null) {
  conversationStore = store;
}
