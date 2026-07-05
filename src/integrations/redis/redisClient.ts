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
    this.values.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  async del(key: string) {
    this.values.delete(key);
  }
}

export class RedisStore implements KeyValueStore {
  private url: URL;

  constructor(redisUrl = process.env.REDIS_URL) {
    if (!redisUrl) {
      throw new Error('REDIS_URL is not configured.');
    }
    this.url = new URL(redisUrl);
  }

  private async send(parts: Array<string | number>): Promise<string | null> {
    const port = Number(this.url.port || (this.url.protocol === 'rediss:' ? 6380 : 6379));
    const host = this.url.hostname;
    const secure = this.url.protocol === 'rediss:';
    const password = decodeURIComponent(this.url.password || '');
    const username = decodeURIComponent(this.url.username || '');

    const socket = await new Promise<RedisSocket>((resolve, reject) => {
      const s = secure
        ? tls.connect({ host, port, servername: host }, () => resolve(s))
        : net.connect({ host, port }, () => resolve(s));
      s.once('error', reject);
    });

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
      socket.once('error', reject);
      socket.write(encodeCommand(command));
    });

    try {
      if (password) {
        const authCommand = username ? ['AUTH', username, password] : ['AUTH', password];
        parseSimpleResponse(await writeAndRead(authCommand));
      }
      return parseSimpleResponse(await writeAndRead(parts));
    } finally {
      socket.end();
    }
  }

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
