import { describe, it, expect, vi, beforeAll } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  verifyTelegramAuth,
  getTokenFromRequest,
  authCookieOptions,
} from '../auth.js';

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn((payload, secret, options) => `mock-token-${payload.userId}`),
    verify: vi.fn((token, secret) => {
      if (token === 'valid-token') return { userId: 'usr_123', role: 'customer' };
      if (token === 'admin-token') return { userId: 'usr_001', role: 'admin' };
      throw new Error('invalid token');
    }),
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn((plain, rounds) => Promise.resolve(`$2b$${rounds}$${Buffer.from(plain).toString('base64')}`)),
    compare: vi.fn((plain, hash) => Promise.resolve(hash === `$2b$12$${Buffer.from(plain).toString('base64')}`)),
  },
}));

describe('hashPassword', () => {
  it('returns a bcrypt hash', async () => {
    const hash = await hashPassword('my_password');
    expect(hash).toContain('$2b$');
  });
});

describe('verifyPassword', () => {
  it('returns true for matching password', async () => {
    const hash = await hashPassword('correct_password');
    const result = await verifyPassword('correct_password', hash);
    expect(result).toBe(true);
  });

  it('returns false for mismatched password', async () => {
    const hash = await hashPassword('correct_password');
    const result = await verifyPassword('wrong_password', hash);
    expect(result).toBe(false);
  });

  it('returns false when hash is null', async () => {
    const result = await verifyPassword('any_password', null);
    expect(result).toBe(false);
  });

  it('returns false when hash is undefined', async () => {
    const result = await verifyPassword('any_password', undefined);
    expect(result).toBe(false);
  });
});

describe('signToken', () => {
  it('creates a signed JWT token', () => {
    const token = signToken({ userId: 'usr_123', role: 'customer' });
    expect(typeof token).toBe('string');
    expect(token).toContain('usr_123');
  });
});

describe('verifyToken', () => {
  it('returns payload for valid token', () => {
    const payload = verifyToken('valid-token');
    expect(payload.userId).toBe('usr_123');
    expect(payload.role).toBe('customer');
  });

  it('verifies admin token', () => {
    const payload = verifyToken('admin-token');
    expect(payload.userId).toBe('usr_001');
    expect(payload.role).toBe('admin');
  });

  it('throws for invalid token', () => {
    expect(() => verifyToken('bad-token')).toThrow('invalid token');
  });
});

describe('verifyTelegramAuth', () => {
  beforeAll(() => {
    process.env.TELEGRAM_BOT_TOKEN = 'test_bot_token_123';
  });

  it('returns false when bot token is missing', () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    const result = verifyTelegramAuth({
      id: 12345,
      first_name: 'Test',
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'abc123',
    });
    expect(result).toBe(false);
    process.env.TELEGRAM_BOT_TOKEN = 'test_bot_token_123';
  });

  it('returns false when hash is missing', () => {
    const result = verifyTelegramAuth({
      id: 12345,
      first_name: 'Test',
      auth_date: Math.floor(Date.now() / 1000),
      hash: '',
    });
    expect(result).toBe(false);
  });

  it('returns false when auth_date is expired (>24h)', () => {
    const oldDate = Math.floor(Date.now() / 1000) - 90000;
    const result = verifyTelegramAuth({
      id: 12345,
      first_name: 'Test',
      auth_date: oldDate,
      hash: 'abc123',
    });
    expect(result).toBe(false);
  });

  it('returns false when id is falsy', () => {
    const result = verifyTelegramAuth({
      id: 0,
      first_name: 'Test',
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'abc123',
    } as any);
    expect(result).toBe(false);
  });
});

describe('getTokenFromRequest', () => {
  it('extracts token from cookies', () => {
    const req = { cookies: { auth_token: 'cookie-token-val' }, headers: {} };
    expect(getTokenFromRequest(req)).toBe('cookie-token-val');
  });

  it('extracts token from Authorization header', () => {
    const req = { cookies: {}, headers: { authorization: 'Bearer header-token' } };
    expect(getTokenFromRequest(req)).toBe('header-token');
  });

  it('prefers cookie over header', () => {
    const req = {
      cookies: { auth_token: 'cookie-token' },
      headers: { authorization: 'Bearer header-token' },
    };
    expect(getTokenFromRequest(req)).toBe('cookie-token');
  });

  it('returns null when no token found', () => {
    const req = { cookies: {}, headers: {} };
    expect(getTokenFromRequest(req)).toBeNull();
  });
});

describe('authCookieOptions', () => {
  it('has httpOnly true', () => {
    expect(authCookieOptions.httpOnly).toBe(true);
  });

  it('has lax sameSite', () => {
    expect(authCookieOptions.sameSite).toBe('lax');
  });

  it('secure is false in test environment', () => {
    expect(authCookieOptions.secure).toBe(false);
  });
});
