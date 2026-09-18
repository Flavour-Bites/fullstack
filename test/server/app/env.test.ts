import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateEnv } from '@server/platform/config/env.js';

describe('validateEnv', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = {
      ...originalEnv,
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'a'.repeat(64),
      TELEGRAM_BOT_TOKEN: '123456:ABC-DEF',
      APP_URL: 'https://flavourbites.com',
      TELEGRAM_WEBHOOK_SECRET: 'super-secret-token-123',
      CLOUDINARY_URL: 'cloudinary://key:secret@cloud',
      TELEGRAM_OPENID_CONNECT_CLIENT_ID: 'test_client_id',
      TELEGRAM_OPENID_CONNECT_CLIENT_SECRET: 'test_client_secret',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('does not throw when all required vars are set', () => {
    expect(() => validateEnv()).not.toThrow();
  });

  it('throws when DATABASE_URL is missing', () => {
    delete process.env.DATABASE_URL;
    expect(() => validateEnv()).toThrow('Missing required environment variables: DATABASE_URL');
  });

  it('throws when JWT_SECRET is missing', () => {
    delete process.env.JWT_SECRET;
    expect(() => validateEnv()).toThrow('Missing required environment variables: JWT_SECRET');
  });

  it('throws when multiple required vars are missing', () => {
    delete process.env.DATABASE_URL;
    delete process.env.TELEGRAM_BOT_TOKEN;
    expect(() => validateEnv()).toThrow('DATABASE_URL');
    expect(() => validateEnv()).toThrow('TELEGRAM_BOT_TOKEN');
  });

  it('throws when APP_URL is a placeholder', () => {
    process.env.NODE_ENV = 'production';
    process.env.APP_URL = 'MY_APP_URL';
    expect(() => validateEnv()).toThrow('In production, APP_URL must be a real URL');
    expect(() => validateEnv()).toThrow('MY_APP_URL');
  });

  it('accepts localhost when not in production', () => {
    process.env.APP_URL = 'http://localhost:3000';
    expect(() => validateEnv()).not.toThrow();
  });

  it('throws when APP_URL is localhost in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.APP_URL = 'http://localhost:3000';
    expect(() => validateEnv()).toThrow('In production, APP_URL must be a real URL');
  });

  it('throws when APP_URL is not a URL', () => {
    process.env.APP_URL = 'not-a-url';
    expect(() => validateEnv()).toThrow('APP_URL must start with http:// or https://');
  });

  it('throws when APP_URL is "changeme"', () => {
    process.env.NODE_ENV = 'production';
    process.env.APP_URL = 'changeme';
    expect(() => validateEnv()).toThrow('In production, APP_URL must be a real URL');
  });

  it('accepts a valid https APP_URL', () => {
    process.env.APP_URL = 'https://flavourbites.com';
    expect(() => validateEnv()).not.toThrow();
  });

  it('accepts a valid http APP_URL', () => {
    process.env.APP_URL = 'http://flavourbites.com';
    expect(() => validateEnv()).not.toThrow();
  });

  it('throws when JWT_SECRET is a placeholder', () => {
    process.env.JWT_SECRET = 'changeme';
    expect(() => validateEnv()).toThrow('JWT_SECRET must be a strong random string');
  });

  it('throws when JWT_SECRET is "secret"', () => {
    process.env.JWT_SECRET = 'secret';
    expect(() => validateEnv()).toThrow('JWT_SECRET must be a strong random string');
  });

  it('throws when JWT_SECRET is "jwt-secret"', () => {
    process.env.JWT_SECRET = 'jwt-secret';
    expect(() => validateEnv()).toThrow('JWT_SECRET must be a strong random string');
  });

  it('throws when JWT_SECRET is "replace-me"', () => {
    process.env.JWT_SECRET = 'replace-me';
    expect(() => validateEnv()).toThrow('JWT_SECRET must be a strong random string');
  });

  it('throws when JWT_SECRET is "your-jwt-secret-here"', () => {
    process.env.JWT_SECRET = 'your-jwt-secret-here';
    expect(() => validateEnv()).toThrow('JWT_SECRET must be a strong random string');
  });

  it('accepts a strong random JWT_SECRET', () => {
    process.env.JWT_SECRET = 'k8sN4xW2mP7qR9vB3tG6hJ1lC5fD0eA8uI2oY4wZ7';
    expect(() => validateEnv()).not.toThrow();
  });

  it('throws when Cloudinary is not configured', () => {
    delete process.env.CLOUDINARY_URL;
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    expect(() => validateEnv()).toThrow('Missing Cloudinary configuration');
  });

  it('accepts CLOUDINARY_URL instead of individual vars', () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    process.env.CLOUDINARY_URL = 'cloudinary://key:secret@cloud';
    expect(() => validateEnv()).not.toThrow();
  });

  it('warns about missing recommended vars', () => {
    delete process.env.GEMINI_API_KEY;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    validateEnv();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('GEMINI_API_KEY')
    );
    warnSpy.mockRestore();
  });

  it('does not warn about recommended vars when present', () => {
    process.env.GEMINI_API_KEY = 'real-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    validateEnv();
    const geminiWarnings = warnSpy.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].includes('GEMINI_API_KEY')
    );
    expect(geminiWarnings).toHaveLength(0);
    warnSpy.mockRestore();
  });
});

describe('getEnv and env singleton', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'test-jwt-secret-key-12345678901234567890',
      TELEGRAM_BOT_TOKEN: '123456:ABC-DEF',
      APP_URL: 'http://localhost:3000',
      TELEGRAM_WEBHOOK_SECRET: 'super-secret-token-123',
      TELEGRAM_OPENID_CONNECT_CLIENT_ID: 'test_client_id',
      TELEGRAM_OPENID_CONNECT_CLIENT_SECRET: 'test_client_secret',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('populates defaults for optional configurations without code fallbacks', async () => {
    const { getEnv, env } = await import('@server/platform/config/env.js');
    const parsed = getEnv();

    expect(parsed.PORT).toBe(3000);
    expect(parsed.CSRF_SECRET).toBe('test-jwt-secret-key-12345678901234567890');
    expect(parsed.FRONTEND_URL).toBe('http://localhost:3000');
    expect(parsed.CLOUDINARY_UPLOAD_FOLDER).toBe('flavour-bites');
    expect(parsed.REDIS_CONVERSATION_TTL_SECONDS).toBe(86400);
    expect(parsed.REDIS_QUOTE_TTL_SECONDS).toBe(1800);
    expect(parsed.isDev).toBe(true);
    expect(parsed.isProd).toBe(false);

    expect(env.CSRF_SECRET).toBe('test-jwt-secret-key-12345678901234567890');
    expect(env.PORT).toBe(3000);
    expect(env.REDIS_CONVERSATION_TTL_SECONDS).toBe(86400);
  });

  it('uses explicit CSRF_SECRET and FRONTEND_URL when provided', async () => {
    process.env.CSRF_SECRET = 'custom-csrf-secret';
    process.env.FRONTEND_URL = 'https://flavour-bites.vercel.app';
    process.env.PORT = '8080';
    process.env.CLOUDINARY_UPLOAD_FOLDER = 'custom-folder';
    process.env.REDIS_CONVERSATION_TTL_SECONDS = '3600';
    process.env.REDIS_QUOTE_TTL_SECONDS = '600';

    const { getEnv } = await import('@server/platform/config/env.js');
    const parsed = getEnv();

    expect(parsed.CSRF_SECRET).toBe('custom-csrf-secret');
    expect(parsed.FRONTEND_URL).toBe('https://flavour-bites.vercel.app');
    expect(parsed.PORT).toBe(8080);
    expect(parsed.CLOUDINARY_UPLOAD_FOLDER).toBe('custom-folder');
    expect(parsed.REDIS_CONVERSATION_TTL_SECONDS).toBe(3600);
    expect(parsed.REDIS_QUOTE_TTL_SECONDS).toBe(600);
  });

  it('auto-recovers APP_URL from Render environment when set to localhost in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.APP_URL = 'http://127.0.0.1:3000';
    process.env.RENDER_EXTERNAL_URL = 'https://flavour-bites-kq9n.onrender.com';

    expect(() => validateEnv()).not.toThrow();

    const { getEnv } = await import('@server/platform/config/env.js');
    const parsed = getEnv();
    expect(parsed.APP_URL).toBe('https://flavour-bites-kq9n.onrender.com');

    delete process.env.RENDER_EXTERNAL_URL;
  });
});
