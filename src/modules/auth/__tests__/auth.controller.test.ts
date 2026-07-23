import { describe, it, expect, vi, beforeEach } from 'vitest';
import { oidcCallbackSchema } from '../auth.schemas.js';

vi.mock('../auth.service.js', () => ({
  authService: {
    initiateOidcFlow: vi.fn(),
    handleOidcCallback: vi.fn(),
    finalizeTelegramLogin: vi.fn(),
    authCookieOptions: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 999 },
  },
}));

import { authController } from '../auth.controller.js';
import { authService } from '../auth.service.js';

function mockReq(overrides: any = {}) {
  return {
    headers: {},
    cookies: {},
    query: {},
    body: {},
    protocol: 'http',
    get: (key: string) => (key === 'host' ? 'localhost:3000' : undefined),
    user: { userId: 'usr_123', role: 'customer' },
    ...overrides,
  } as any;
}

function mockRes() {
  const res: any = {};
  res.cookie = vi.fn(() => res);
  res.clearCookie = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.redirect = vi.fn(() => res);
  res.status = vi.fn(() => res);
  return res;
}

describe('oidcCallbackSchema validation', () => {
  it('accepts valid code and state', () => {
    const result = oidcCallbackSchema.safeParse({
      code: 'auth_code_123',
      state: 'state_xyz',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing code', () => {
    const result = oidcCallbackSchema.safeParse({
      state: 'state_xyz',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing state', () => {
    const result = oidcCallbackSchema.safeParse({
      code: 'auth_code_123',
    });
    expect(result.success).toBe(false);
  });
});

describe('authController.initiateTelegramLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to Telegram authorizationUrl', async () => {
    vi.mocked(authService.initiateOidcFlow).mockResolvedValueOnce({
      authorizationUrl: 'https://oauth.telegram.org/auth?client_id=123',
      state: 'state_jwt',
    });

    const req = mockReq();
    const res = mockRes();

    await authController.initiateTelegramLogin(req, res, vi.fn());

    expect(res.redirect).toHaveBeenCalledWith('https://oauth.telegram.org/auth?client_id=123');
  });

  it('returns JSON authorizationUrl when requested via JSON Accept header', async () => {
    vi.mocked(authService.initiateOidcFlow).mockResolvedValueOnce({
      authorizationUrl: 'https://oauth.telegram.org/auth?client_id=123',
      state: 'state_jwt',
    });

    const req = mockReq({ headers: { accept: 'application/json' } });
    const res = mockRes();

    await authController.initiateTelegramLogin(req, res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      authorizationUrl: 'https://oauth.telegram.org/auth?client_id=123',
    });
  });
});

describe('authController.handleTelegramCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles callback, sets auth_token cookie, and redirects', async () => {
    vi.mocked(authService.handleOidcCallback).mockResolvedValueOnce({
      success: true,
      token: 'jwt_app_token',
      user: { id: 'usr_1', name: 'User' } as any,
    });

    const req = mockReq({
      method: 'GET',
      query: { code: 'c_123', state: 's_123' },
    });
    const res = mockRes();

    await authController.handleTelegramCallback(req, res, vi.fn());

    expect(res.cookie).toHaveBeenCalledWith('auth_token', 'jwt_app_token', expect.any(Object));
    expect(res.redirect).toHaveBeenCalledWith('/');
  });
});

describe('authController.finalizeTelegram', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns token on valid password', async () => {
    vi.mocked(authService.finalizeTelegramLogin).mockResolvedValueOnce({
      success: true,
      token: 'jwt_app_token',
      user: { id: 'usr_1', name: 'User' } as any,
    });

    const req = mockReq({ body: { telegramId: '12345', password: 'correct' } });
    const res = mockRes();

    await authController.finalizeTelegram(req, res, vi.fn());

    expect(authService.finalizeTelegramLogin).toHaveBeenCalledWith('12345', 'correct');
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      token: 'jwt_app_token',
      user: { id: 'usr_1', name: 'User' },
    });
  });

  it('sets auth_token cookie on success', async () => {
    vi.mocked(authService.finalizeTelegramLogin).mockResolvedValueOnce({
      success: true,
      token: 'jwt_app_token',
      user: { id: 'usr_1', name: 'User' } as any,
    });

    const req = mockReq({ body: { telegramId: '12345', password: 'correct' } });
    const res = mockRes();

    await authController.finalizeTelegram(req, res, vi.fn());

    expect(res.cookie).toHaveBeenCalledWith('auth_token', 'jwt_app_token', expect.any(Object));
  });
});
