import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '@/shared/errors/AuthenticationError.js';

vi.mock('@/shared/utils/auth.js', () => ({
  getTokenFromRequest: vi.fn(),
  verifyToken: vi.fn(),
}));

import { requireAuth } from '@/app/middleware/requireAuth.js';
import { getTokenFromRequest, verifyToken } from '@/shared/utils/auth.js';

const mockGetTokenFromRequest = vi.mocked(getTokenFromRequest);
const mockVerifyToken = vi.mocked(verifyToken);

function createReq(overrides: Partial<{ cookies: Record<string, string>; headers: Record<string, string> }> = {}) {
  return {
    cookies: {},
    headers: {},
    ...overrides,
  } as unknown as Request;
}

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

function createNext() {
  return vi.fn() as unknown as NextFunction;
}

describe('requireAuth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws AuthenticationError when no token is provided', () => {
    mockGetTokenFromRequest.mockReturnValue(null);

    expect(() => requireAuth(createReq(), createRes(), createNext()))
      .toThrow(AuthenticationError);
  });

  it('throws AuthenticationError with "Please sign in" when no token', () => {
    mockGetTokenFromRequest.mockReturnValue(null);

    expect(() => requireAuth(createReq(), createRes(), createNext()))
      .toThrow('Please sign in.');
  });

  it('calls next() when token is valid', () => {
    mockGetTokenFromRequest.mockReturnValue('valid-token');
    mockVerifyToken.mockReturnValue({ userId: 'usr_123', role: 'customer' });
    const next = createNext();

    const req = createReq();
    requireAuth(req, createRes(), next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ userId: 'usr_123', role: 'customer' });
  });

  it('throws AuthenticationError when token verification fails', () => {
    mockGetTokenFromRequest.mockReturnValue('bad-token');
    mockVerifyToken.mockImplementation(() => { throw new Error('invalid signature'); });

    expect(() => requireAuth(createReq(), createRes(), createNext()))
      .toThrow(AuthenticationError);
  });

  it('throws when token payload has no userId', () => {
    mockGetTokenFromRequest.mockReturnValue('token-no-user');
    mockVerifyToken.mockReturnValue({ userId: '', role: 'customer' });

    expect(() => requireAuth(createReq(), createRes(), createNext()))
      .toThrow('Please sign in again.');
  });

  it('throws when token payload has no role', () => {
    mockGetTokenFromRequest.mockReturnValue('token-no-role');
    // Return a payload missing the role field entirely
    mockVerifyToken.mockReturnValue({ userId: 'usr_123' } as any);

    expect(() => requireAuth(createReq(), createRes(), createNext()))
      .toThrow('Please sign in again.');
  });

  it('accepts admin role', () => {
    mockGetTokenFromRequest.mockReturnValue('admin-token');
    mockVerifyToken.mockReturnValue({ userId: 'usr_admin', role: 'admin' });
    const next = createNext();

    const req = createReq();
    requireAuth(req, createRes(), next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ userId: 'usr_admin', role: 'admin' });
  });

  it('accepts staff role', () => {
    mockGetTokenFromRequest.mockReturnValue('staff-token');
    mockVerifyToken.mockReturnValue({ userId: 'usr_staff', role: 'staff' });
    const next = createNext();

    const req = createReq();
    requireAuth(req, createRes(), next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ userId: 'usr_staff', role: 'staff' });
  });
});
