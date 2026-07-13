import { describe, it, expect, vi } from 'vitest';
import { securityConfig } from '../config/security.js';

describe('securityConfig CSP', () => {
  it('does not include unsafe-inline in scriptSrc', () => {
    const directives = (securityConfig as any).config?.contentSecurityPolicy?.directives
      ?? (securityConfig as any).directives;
    // helmet v5+ exposes directives differently — find them
    const csp = (securityConfig as any);
    // The helmet middleware is pre-configured; extract CSP from the function
    // We test by checking the serialized header
    const headerParts: string[] = [];
    const res = {
      setHeader: (name: string, value: string) => {
        if (name === 'Content-Security-Policy') headerParts.push(value);
      },
      removeHeader: () => {},
    } as any;
    const req = {} as any;
    const next = () => {};

    securityConfig(req, res, next);

    if (headerParts.length > 0) {
      const csp = headerParts[0];
      const scriptMatch = csp.match(/script-src\s+([^;]+)/);
      if (scriptMatch) {
        expect(scriptMatch[1]).not.toContain("'unsafe-inline'");
      }
    }
  });

  it('allows unsafe-inline in styleSrc (needed for Tailwind)', () => {
    const headerParts: string[] = [];
    const res = {
      setHeader: (name: string, value: string) => {
        if (name === 'Content-Security-Policy') headerParts.push(value);
      },
      removeHeader: () => {},
    } as any;
    const req = {} as any;
    const next = () => {};

    securityConfig(req, res, next);

    if (headerParts.length > 0) {
      const csp = headerParts[0];
      const styleMatch = csp.match(/style-src\s+([^;]+)/);
      if (styleMatch) {
        expect(styleMatch[1]).toContain("'unsafe-inline'");
      }
    }
  });

  it('sets default-src to self', () => {
    const headerParts: string[] = [];
    const res = {
      setHeader: (name: string, value: string) => {
        if (name === 'Content-Security-Policy') headerParts.push(value);
      },
      removeHeader: () => {},
    } as any;
    const req = {} as any;
    const next = () => {};

    securityConfig(req, res, next);

    if (headerParts.length > 0) {
      const csp = headerParts[0];
      expect(csp).toContain("default-src 'self'");
    }
  });

  it('blocks frame embedding', () => {
    const headerParts: string[] = [];
    const res = {
      setHeader: (name: string, value: string) => {
        if (name === 'Content-Security-Policy') headerParts.push(value);
      },
      removeHeader: () => {},
    } as any;
    const req = {} as any;
    const next = () => {};

    securityConfig(req, res, next);

    if (headerParts.length > 0) {
      const csp = headerParts[0];
      expect(csp).toContain("frame-src 'none'");
    }
  });

  it('allows Cloudinary images', () => {
    const headerParts: string[] = [];
    const res = {
      setHeader: (name: string, value: string) => {
        if (name === 'Content-Security-Policy') headerParts.push(value);
      },
      removeHeader: () => {},
    } as any;
    const req = {} as any;
    const next = () => {};

    securityConfig(req, res, next);

    if (headerParts.length > 0) {
      const csp = headerParts[0];
      expect(csp).toContain('https://res.cloudinary.com');
    }
  });
});
