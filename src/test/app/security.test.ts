import { describe, it, expect } from 'vitest';
import { securityConfig, createSecurityConfig } from '@/app/config/security.js';

function runMiddleware(middleware: any) {
  const headers: Record<string, string> = {};
  const res = {
    setHeader: (name: string, value: string) => { headers[name] = value; },
    removeHeader: (name: string) => { delete headers[name]; },
  } as any;
  const req = {} as any;
  middleware(req, res, () => {});
  return headers;
}

describe('securityConfig CSP', () => {
  it('does not include unsafe-inline in scriptSrc when NODE_ENV=production', () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const prodConfig = createSecurityConfig();
    process.env.NODE_ENV = origEnv;

    const headers = runMiddleware(prodConfig);
    const csp = headers['Content-Security-Policy'] || '';
    const scriptMatch = csp.match(/script-src\s+([^;]+)/);
    if (scriptMatch) {
      expect(scriptMatch[1]).not.toContain("'unsafe-inline'");
    }
  });

  it('allows unsafe-inline in styleSrc (needed for Tailwind)', () => {
    const headers = runMiddleware(securityConfig);
    const csp = headers['Content-Security-Policy'] || '';
    const styleMatch = csp.match(/style-src\s+([^;]+)/);
    if (styleMatch) {
      expect(styleMatch[1]).toContain("'unsafe-inline'");
    }
  });

  it('sets default-src to self', () => {
    const headers = runMiddleware(securityConfig);
    const csp = headers['Content-Security-Policy'] || '';
    expect(csp).toContain("default-src 'self'");
  });

  it('allows Telegram frames including oauth.telegram.org', () => {
    const headers = runMiddleware(securityConfig);
    const csp = headers['Content-Security-Policy'] || '';
    const frameMatch = csp.match(/frame-src\s+([^;]+)/);
    expect(frameMatch).not.toBeNull();
    if (frameMatch) {
      expect(frameMatch[1]).toContain('https://telegram.org');
      expect(frameMatch[1]).toContain('https://oauth.telegram.org');
    }
  });

  it('allows Cloudinary images', () => {
    const headers = runMiddleware(securityConfig);
    const csp = headers['Content-Security-Policy'] || '';
    expect(csp).toContain('https://res.cloudinary.com');
  });

  it('does not set X-Frame-Options (frameguard disabled for Telegram OAuth)', () => {
    const headers = runMiddleware(securityConfig);
    expect(headers['X-Frame-Options']).toBeUndefined();
  });

  it('does not set cross-origin headers that block Telegram OAuth', () => {
    const headers = runMiddleware(securityConfig);
    expect(headers['Cross-Origin-Embedder-Policy']).toBeUndefined();
    expect(headers['Cross-Origin-Opener-Policy']).toBeUndefined();
    expect(headers['Cross-Origin-Resource-Policy']).toBeUndefined();
  });
});
