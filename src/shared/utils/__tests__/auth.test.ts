import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import crypto from 'crypto';
import * as jose from 'jose';
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  getTokenFromRequest,
  authCookieOptions,
} from '../auth.js';

vi.mock('jose', () => ({
  jwtVerify: vi.fn(),
  createRemoteJWKSet: vi.fn(),
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn((payload) => `mock-token-${payload.userId}`),
    verify: vi.fn((token) => {
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
  beforeAll(() => { process.env.JWT_SECRET = 'test-secret'; });
  afterAll(() => { delete process.env.JWT_SECRET; });

  it('creates a signed JWT token', () => {
    const token = signToken({ userId: 'usr_123', role: 'customer' });
    expect(typeof token).toBe('string');
    expect(token).toContain('usr_123');
  });
});

describe('verifyToken', () => {
  beforeAll(() => { process.env.JWT_SECRET = 'test-secret'; });
  afterAll(() => { delete process.env.JWT_SECRET; });

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

import {
  generateState,
  generateNonce,
  generatePkcePair,
  verifyOidcIdToken,
  TELEGRAM_ISSUER,
} from '../auth.js';

describe('OIDC Security Generators', () => {
  it('generates random hex state', () => {
    const s1 = generateState();
    const s2 = generateState();
    expect(typeof s1).toBe('string');
    expect(s1.length).toBe(64);
    expect(s1).not.toBe(s2);
  });

  it('generates random hex nonce', () => {
    const n1 = generateNonce();
    const n2 = generateNonce();
    expect(typeof n1).toBe('string');
    expect(n1.length).toBe(64);
    expect(n1).not.toBe(n2);
  });

  it('generates PKCE verifier and challenge (S256)', () => {
    const { codeVerifier, codeChallenge } = generatePkcePair();
    expect(typeof codeVerifier).toBe('string');
    expect(codeVerifier.length).toBeGreaterThanOrEqual(43);
    expect(typeof codeChallenge).toBe('string');
    const computed = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    expect(codeChallenge).toBe(computed);
  });
});

describe('verifyOidcIdToken', () => {
  beforeAll(() => {
    process.env.TELEGRAM_OPENID_CONNECT_CLIENT_ID = 'test_client_id';
  });

  it('throws error when CLIENT_ID env is missing', async () => {
    delete process.env.TELEGRAM_OPENID_CONNECT_CLIENT_ID;
    await expect(verifyOidcIdToken('dummy_token')).rejects.toThrow('TELEGRAM_OPENID_CONNECT_CLIENT_ID is not configured');
    process.env.TELEGRAM_OPENID_CONNECT_CLIENT_ID = 'test_client_id';
  });

  it('verifies signed JWT against supplied JWKS', async () => {
    const mockJwks = vi.fn().mockResolvedValue({} as any);
    vi.mocked(jose.jwtVerify).mockResolvedValueOnce({
      payload: {
        iss: TELEGRAM_ISSUER,
        aud: 'test_client_id',
        sub: '123456789',
        id: 123456789,
        name: 'Jane Doe',
        nonce: 'test_nonce',
      },
      protectedHeader: { alg: 'RS256' },
    } as any);

    const claims = await verifyOidcIdToken('valid_jwt_token', 'test_nonce', mockJwks);
    expect(claims.sub).toBe('123456789');
    expect(claims.name).toBe('Jane Doe');
  });

  it('rejects token with mismatched nonce', async () => {
    const mockJwks = vi.fn().mockResolvedValue({} as any);
    vi.mocked(jose.jwtVerify).mockResolvedValueOnce({
      payload: {
        iss: TELEGRAM_ISSUER,
        aud: 'test_client_id',
        sub: '123456789',
        nonce: 'bad_nonce',
      },
      protectedHeader: { alg: 'RS256' },
    } as any);

    await expect(verifyOidcIdToken('valid_jwt_token', 'expected_nonce', mockJwks)).rejects.toThrow('Invalid nonce in ID token.');
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
