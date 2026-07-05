import { getRedisStore, type KeyValueStore } from './redisClient.js';

export interface OrderConversation {
  step: string;
  userId: string;
  contactName: string;
  contactPhone: string;
  eventType?: string;
  deliveryDate?: string;
  guestCount?: number;
  flavor?: string;
  designStyle?: string;
  tierCount?: number;
  specialInstructions?: string;
  deliveryOption?: string;
  deliveryAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteConversation {
  orderId: string;
  createdAt: string;
  updatedAt: string;
}

const ORDER_TTL_SECONDS = Number(process.env.REDIS_CONVERSATION_TTL_SECONDS || 60 * 60 * 24);
const QUOTE_TTL_SECONDS = Number(process.env.REDIS_QUOTE_TTL_SECONDS || 60 * 30);

const orderKey = (telegramId: string) => `fb:conversation:order:${telegramId}`;
const quoteKey = (telegramId: string) => `fb:conversation:quote:${telegramId}`;

function stamp<T extends object>(value: T): T & { updatedAt: string } {
  return { ...value, updatedAt: new Date().toISOString() };
}

export class ConversationStateStore {
  constructor(private store: KeyValueStore = getRedisStore()) {}

  async getOrder(telegramId: string) {
    const raw = await this.store.get(orderKey(telegramId));
    return raw ? JSON.parse(raw) as OrderConversation : null;
  }

  async setOrder(telegramId: string, conversation: OrderConversation) {
    await this.store.set(orderKey(telegramId), JSON.stringify(stamp(conversation)), ORDER_TTL_SECONDS);
  }

  async clearOrder(telegramId: string) {
    await this.store.del(orderKey(telegramId));
  }

  async getQuote(telegramId: string) {
    const raw = await this.store.get(quoteKey(telegramId));
    return raw ? JSON.parse(raw) as QuoteConversation : null;
  }

  async setQuote(telegramId: string, quote: QuoteConversation) {
    await this.store.set(quoteKey(telegramId), JSON.stringify(stamp(quote)), QUOTE_TTL_SECONDS);
  }

  async clearQuote(telegramId: string) {
    await this.store.del(quoteKey(telegramId));
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
