import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateEnv } from '../config/env.js';

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
    process.env.APP_URL = 'MY_APP_URL';
    expect(() => validateEnv()).toThrow('APP_URL must be a real URL');
    expect(() => validateEnv()).toThrow('MY_APP_URL');
  });

  it('throws when APP_URL is localhost', () => {
    process.env.APP_URL = 'http://localhost:3000';
    expect(() => validateEnv()).toThrow('APP_URL must be a real URL');
  });

  it('throws when APP_URL is not a URL', () => {
    process.env.APP_URL = 'not-a-url';
    expect(() => validateEnv()).toThrow('APP_URL must be a real URL');
  });

  it('throws when APP_URL is "changeme"', () => {
    process.env.APP_URL = 'changeme';
    expect(() => validateEnv()).toThrow('APP_URL must be a real URL');
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
