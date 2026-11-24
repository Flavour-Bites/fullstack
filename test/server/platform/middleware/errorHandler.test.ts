import { describe, it, expect, vi } from 'vitest';
import { errorHandler } from '@server/platform/middleware/errorHandler.js';

function createMockRes() {
  let statusCode = 200;
  let jsonBody: any = null;
  const res: any = {
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (body: any) => {
      jsonBody = body;
      return res;
    },
  };
  Object.defineProperty(res, 'statusCode', { get: () => statusCode });
  Object.defineProperty(res, 'jsonBody', { get: () => jsonBody });
  return res;
}

describe('errorHandler', () => {
  it('returns 413 PAYLOAD_TOO_LARGE when body exceeds size limit (entity.too.large)', () => {
    const err = Object.assign(new Error('request entity too large'), {
      type: 'entity.too.large',
      status: 413,
      statusCode: 413,
    });
    const req = {} as any;
    const res = createMockRes();
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(413);
    expect(res.jsonBody.code).toBe('PAYLOAD_TOO_LARGE');
    expect(res.jsonBody.error).toContain('too large');
  });

  it('returns 400 BAD_REQUEST for malformed JSON syntax errors', () => {
    const err = Object.assign(new SyntaxError('Unexpected token in JSON'), {
      status: 400,
      body: '{invalid-json',
    });
    const req = {} as any;
    const res = createMockRes();
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.jsonBody.code).toBe('BAD_REQUEST');
  });

  it('preserves other 4xx client errors without turning into 500', () => {
    const err = Object.assign(new Error('Unsupported Media Type'), {
      status: 415,
    });
    const req = {} as any;
    const res = createMockRes();
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(415);
    expect(res.jsonBody.code).toBe('CLIENT_ERROR');
  });
});

