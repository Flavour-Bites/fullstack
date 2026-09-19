import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isOriginAllowed, createCorsOptions } from '@server/platform/config/cors.js';
import { isLocalhostUrl } from '@server/platform/config/env.js';

describe('CORS configuration', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      APP_URL: 'https://api.flavourbites.com',
      FRONTEND_URL: 'https://flavour-bites.vercel.app',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('isLocalhostUrl', () => {
    it('detects localhost and loopback IPv4/IPv6', () => {
      expect(isLocalhostUrl('http://localhost:3000')).toBe(true);
      expect(isLocalhostUrl('http://localhost:5173')).toBe(true);
      expect(isLocalhostUrl('http://127.0.0.1:3000')).toBe(true);
      expect(isLocalhostUrl('http://127.0.0.1:8080')).toBe(true);
      expect(isLocalhostUrl('http://[::1]:3000')).toBe(true);
      expect(isLocalhostUrl('http://0.0.0.0:3000')).toBe(true);
    });

    it('rejects external origins and malformed strings', () => {
      expect(isLocalhostUrl('https://flavourbites.com')).toBe(false);
      expect(isLocalhostUrl('https://localhost.attacker.com')).toBe(false);
      expect(isLocalhostUrl('invalid-url')).toBe(false);
    });
  });

  describe('isOriginAllowed', () => {
    it('allows requests without origin (same-origin, curl, server-to-server, Telegram webhooks)', () => {
      expect(isOriginAllowed(undefined)).toBe(true);
    });

    it('allows configured FRONTEND_URL in production and development', () => {
      expect(isOriginAllowed('https://flavour-bites.vercel.app')).toBe(true);
    });

    it('allows the server own origin (same-origin asset requests in CORS mode)', () => {
      expect(isOriginAllowed('https://api.flavourbites.com')).toBe(true);
    });

    it('allows loopback origins in development/test', () => {
      process.env.NODE_ENV = 'development';
      expect(isOriginAllowed('http://localhost:5173')).toBe(true);
      expect(isOriginAllowed('http://localhost:3000')).toBe(true);
      expect(isOriginAllowed('http://127.0.0.1:5173')).toBe(true);
    });

    it('blocks localhost origins in production', () => {
      process.env.NODE_ENV = 'production';
      expect(isOriginAllowed('http://localhost:5173')).toBe(false);
      expect(isOriginAllowed('http://localhost:3000')).toBe(false);
      expect(isOriginAllowed('http://127.0.0.1:5173')).toBe(false);
    });

    it('denies unauthorized external origins in both dev and production', () => {
      process.env.NODE_ENV = 'production';
      expect(isOriginAllowed('https://malicious-site.com')).toBe(false);
      expect(isOriginAllowed('https://evil-flavourbites.com')).toBe(false);

      process.env.NODE_ENV = 'development';
      expect(isOriginAllowed('https://malicious-site.com')).toBe(false);
    });
  });

  describe('createCorsOptions', () => {
    it('configures credentials, allowed headers, and exposed CSRF header', () => {
      const options = createCorsOptions();
      expect(options.credentials).toBe(true);
      expect(options.exposedHeaders).toContain('x-csrf-token');
      expect(options.methods).toContain('POST');
      expect(options.allowedHeaders).toContain('Content-Type');
      expect(options.allowedHeaders).toContain('Authorization');
      expect(options.allowedHeaders).toContain('x-csrf-token');
    });

    it('executes origin callback with success when origin is allowed', () => {
      const options = createCorsOptions();
      const originFn = options.origin as (
        origin: string | undefined,
        cb: (err: Error | null, allow?: boolean) => void,
      ) => void;

      let allowedResult: boolean | undefined;
      let errorResult: Error | null = null;

      originFn('https://flavour-bites.vercel.app', (err, allow) => {
        errorResult = err;
        allowedResult = allow;
      });

      expect(errorResult).toBeNull();
      expect(allowedResult).toBe(true);
    });

    it('denies a blocked origin by omitting CORS headers (no error, no 500)', () => {
      process.env.NODE_ENV = 'production';
      const options = createCorsOptions();
      const originFn = options.origin as (
        origin: string | undefined,
        cb: (err: Error | null, allow?: boolean) => void,
      ) => void;

      let allowResult: boolean | undefined;
      let errorResult: Error | null = null;

      originFn('https://unauthorized-domain.com', (err, allow) => {
        errorResult = err;
        allowResult = allow;
      });

      expect(errorResult).toBeNull();
      expect(allowResult).toBe(false);
    });
  });
});
