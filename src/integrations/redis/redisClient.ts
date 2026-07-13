import net from 'net';
import tls from 'tls';

type RedisSocket = net.Socket | tls.TLSSocket;

function encodeCommand(parts: Array<string | number>) {
  return `*${parts.length}\r\n${parts.map((part) => {
    const text = String(part);
    return `$${Buffer.byteLength(text)}\r\n${text}\r\n`;
  }).join('')}`;
}

function parseSimpleResponse(raw: string): string | null {
  if (raw.startsWith('$-1')) return null;
  if (raw.startsWith('+')) return raw.slice(1).split('\r\n')[0];
  if (raw.startsWith(':')) return raw.slice(1).split('\r\n')[0];
  if (raw.startsWith('$')) {
    const [, rest] = raw.split('\r\n', 2);
    return rest ?? null;
  }
  if (raw.startsWith('-')) {
    throw new Error(raw.slice(1).split('\r\n')[0]);
  }
  return raw;
}

export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

const MEMORY_STORE_MAX_ENTRIES = 10_000;

class MemoryStore implements KeyValueStore {
  private values = new Map<string, { value: string; expiresAt: number | null }>();

  async get(key: string) {
    const entry = this.values.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.values.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (this.values.size >= MEMORY_STORE_MAX_ENTRIES && !this.values.has(key)) {
      this.evict();
    }
    this.values.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  async del(key: string) {
    this.values.delete(key);
  }

  private evict() {
    // Remove expired entries first
    const now = Date.now();
    for (const [k, v] of this.values) {
      if (v.expiresAt !== null && v.expiresAt <= now) {
        this.values.delete(k);
      }
    }
    // If still over limit, remove oldest entries (first 10%)
    if (this.values.size >= MEMORY_STORE_MAX_ENTRIES) {
      const keysToDelete = Array.from(this.values.keys()).slice(0, Math.floor(MEMORY_STORE_MAX_ENTRIES * 0.1));
      for (const k of keysToDelete) {
        this.values.delete(k);
      }
    }
  }
}

export class RedisStore implements KeyValueStore {
  private url: URL;
  private socket: RedisSocket | null = null;
  private connecting = false;
  private connectPromise: Promise<RedisSocket> | null = null;

  constructor(redisUrl = process.env.REDIS_URL) {
    if (!redisUrl) {
      throw new Error('REDIS_URL is not configured.');
    }
    this.url = new URL(redisUrl);
  }

  private async getSocket(): Promise<RedisSocket> {
    if (this.socket && !this.socket.destroyed) return this.socket;
    if (this.connectPromise) return this.connectPromise;

    this.connecting = true;
    this.connectPromise = this.createSocket();
    try {
      this.socket = await this.connectPromise;
      return this.socket;
    } finally {
      this.connecting = false;
      this.connectPromise = null;
    }
  }

  private createSocket(): Promise<RedisSocket> {
    const port = Number(this.url.port || (this.url.protocol === 'rediss:' ? 6380 : 6379));
    const host = this.url.hostname;
    const secure = this.url.protocol === 'rediss:';

    return new Promise<RedisSocket>((resolve, reject) => {
      const s = secure
        ? tls.connect({ host, port, servername: host }, () => resolve(s))
        : net.connect({ host, port }, () => resolve(s));
      s.once('error', reject);
    });
  }

  private async send(parts: Array<string | number>): Promise<string | null> {
    const password = decodeURIComponent(this.url.password || '');
    const username = decodeURIComponent(this.url.username || '');

    const socket = await this.getSocket();

    const writeAndRead = (command: Array<string | number>) => new Promise<string>((resolve, reject) => {
      let data = '';
      const onData = (chunk: Buffer) => {
        data += chunk.toString('utf8');
        if (data.includes('\r\n')) {
          socket.off('data', onData);
          resolve(data);
        }
      };
      socket.on('data', onData);
      socket.once('error', (err) => {
        socket.off('data', onData);
        this.socket = null;
        reject(err);
      });
      socket.write(encodeCommand(command));
    });

    try {
      if (password && !this._authenticated) {
        const authCommand = username ? ['AUTH', username, password] : ['AUTH', password];
        parseSimpleResponse(await writeAndRead(authCommand));
        this._authenticated = true;
      }
      return parseSimpleResponse(await writeAndRead(parts));
    } catch (err) {
      this.socket = null;
      this._authenticated = false;
      throw err;
    }
  }

  private _authenticated = false;

  async get(key: string) {
    return this.send(['GET', key]);
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      await this.send(['SET', key, value, 'EX', ttlSeconds]);
    } else {
      await this.send(['SET', key, value]);
    }
  }

  async del(key: string) {
    await this.send(['DEL', key]);
  }
}

let redisInstance: KeyValueStore | null = null;

export function getRedisStore() {
  if (!redisInstance) {
    redisInstance = process.env.REDIS_URL ? new RedisStore() : new MemoryStore();
  }
  return redisInstance;
}

export function setRedisStoreForTests(store: KeyValueStore | null) {
  redisInstance = store;
}
