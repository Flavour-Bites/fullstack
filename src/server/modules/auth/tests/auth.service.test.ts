import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '@server/modules/auth/auth.service.js';

const mockUser = {
  id: 'usr_123',
  name: 'Test User',
  role: 'customer' as const,
  telegramId: '12345',
  telegramUsername: 'testuser',
  telegramPhone: null,
  telegramPhoto: null,
  notifyViaTelegram: false,
  createdAt: new Date('2024-01-01'),
  passwordHash: null,
};

const mockExistingUser = {
  ...mockUser,
  id: 'existing',
  telegramId: '12345',
  passwordHash: 'hashed:mypass',
};

vi.mock('@shared/utils/auth.ts', () => ({
  signToken: vi.fn((payload) => `token-${payload.userId}`),
  verifyPassword: vi.fn((plain, hash) => Promise.resolve(hash === `hashed:${plain}`)),
  hashPassword: vi.fn((plain) => Promise.resolve(`hashed:${plain}`)),
  generateState: vi.fn(() => 'mock_state_123'),
  generateNonce: vi.fn(() => 'mock_nonce_123'),
  generatePkcePair: vi.fn(() => ({ codeVerifier: 'mock_verifier_123', codeChallenge: 'mock_challenge_123' })),
  verifyOidcIdToken: vi.fn(() => Promise.resolve({ id: '12345', sub: '12345', name: 'Test User' })),
  authCookieOptions: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 999 },
}));

vi.mock('@server/platform/integrations/telegram/telegramClient.js', () => ({
  sendMessage: vi.fn(() => Promise.resolve(true)),
}));

vi.mock('@server/modules/auth/auth.repository.ts', () => ({
  authRepository: {
    upsertTelegramUser: vi.fn(() => Promise.resolve(mockUser)),
    findByTelegramId: vi.fn((id) => {
      if (id === '12345') return Promise.resolve(mockUser);
      if (id === 'existing') return Promise.resolve(mockExistingUser);
      return Promise.resolve(null);
    }),
    findById: vi.fn((id) => {
      if (id === 'usr_123') return Promise.resolve(mockUser);
      return Promise.resolve(null);
    }),
    updatePassword: vi.fn((_, hash) => Promise.resolve({ ...mockUser, passwordHash: hash })),
    toPublic: vi.fn((user) => ({
      id: user.id,
      name: user.name,
      role: user.role,
      telegramId: user.telegramId,
      telegramUsername: user.telegramUsername,
      telegramPhone: user.telegramPhone,
      telegramPhoto: user.telegramPhoto,
      notifyViaTelegram: user.notifyViaTelegram,
      createdAt: user.createdAt?.toISOString?.() ?? '',
    })),
  },
}));

vi.mock('@server/platform/integrations/redis/redisClient.js', () => ({
  getRedisStore: vi.fn(() => ({
    set: vi.fn().mockResolvedValue('OK'),
    get: vi.fn((key) => {
      if (key.includes('unknown_state')) return Promise.resolve(null);
      return Promise.resolve(JSON.stringify({ codeVerifier: 'mock_verifier', redirectUri: 'https://example.com/callback' }));
    }),
    del: vi.fn().mockResolvedValue(1),
  })),
}));

describe('authService.finalizeTelegramLogin', () => {
  it('throws when account not found', async () => {
    await expect(authService.finalizeTelegramLogin('nonexistent', 'pass'))
      .rejects.toThrow('Account not found');
  });

  it('throws on wrong password', async () => {
    await expect(authService.finalizeTelegramLogin('existing', 'wrongpass'))
      .rejects.toThrow('That password is not correct');
  });

  it('returns token on correct password', async () => {
    const result = await authService.finalizeTelegramLogin('existing', 'mypass');
    expect(result.success).toBe(true);
    expect(result.token).toBe('token-existing');
  });
});

describe('authService.setPassword', () => {
  it('updates the password hash', async () => {
    await authService.setPassword('usr_123', 'newpass');
    const { authRepository } = await import('@server/modules/auth/auth.repository.ts');
    expect(authRepository.updatePassword).toHaveBeenCalledWith('usr_123', 'hashed:newpass');
  });
});

describe('authService.getCurrentUser', () => {
  it('returns public user data', async () => {
    const result = await authService.getCurrentUser('usr_123');
    expect(result.name).toBe('Test User');
  });

  it('throws when user not found', async () => {
    await expect(authService.getCurrentUser('usr_none')).rejects.toThrow('Account not found');
  });
});

describe('authService.telegramPasswordLogin', () => {
  it('throws when account not found', async () => {
    await expect(authService.telegramPasswordLogin('nobody', 'x'))
      .rejects.toThrow('Account not found');
  });

  it('returns token on valid credentials', async () => {
    const result = await authService.telegramPasswordLogin('existing', 'mypass');
    expect(result.success).toBe(true);
  });
});

describe('authService.verifyUserPassword', () => {
  it('returns false when no password set', async () => {
    const valid = await authService.verifyUserPassword('usr_123', 'anypass');
    expect(valid).toBe(false);
  });
});

describe('authService.initiateOidcFlow', () => {
  beforeEach(() => {
    process.env.TELEGRAM_OPENID_CONNECT_CLIENT_ID = 'test_client_id';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        issuer: 'https://oauth.telegram.org',
        authorization_endpoint: 'https://oauth.telegram.org/auth',
        token_endpoint: 'https://oauth.telegram.org/token',
        jwks_uri: 'https://oauth.telegram.org/.well-known/jwks.tson',
      }),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns authorizationUrl with required OIDC params including telegram:bot_access', async () => {
    const result = await authService.initiateOidcFlow('https://example.com/callback');
    expect(result.authorizationUrl).toContain('client_id=test_client_id');
    expect(result.authorizationUrl).toContain('response_type=code');
    expect(result.authorizationUrl).toContain('code_challenge_method=S256');
    expect(result.authorizationUrl).toContain('scope=openid');
    expect(decodeURIComponent(result.authorizationUrl)).toContain('telegram:bot_access');
    expect(result.state).toBeDefined();
    expect(result.state).toHaveLength(32);
  });

  it('throws when CLIENT_ID is missing', async () => {
    delete process.env.TELEGRAM_OPENID_CONNECT_CLIENT_ID;
    await expect(authService.initiateOidcFlow('https://example.com/callback'))
      .rejects.toThrow('TELEGRAM_OPENID_CONNECT_CLIENT_ID is not configured');
    process.env.TELEGRAM_OPENID_CONNECT_CLIENT_ID = 'test_client_id';
  });
});

describe('authService.handleOidcCallback', () => {
  it('throws on unknown state (CSRF)', async () => {
    await expect(authService.handleOidcCallback({
      code: 'c_123',
      state: 'unknown_state_not_in_map',
      redirectUri: 'https://example.com/callback',
    })).rejects.toThrow('Invalid OAuth state');
  });

  it('exchanges code for tokens, verifies id_token, and records bot write access', async () => {
    process.env.TELEGRAM_OPENID_CONNECT_CLIENT_ID = 'test_client_id';
    process.env.TELEGRAM_OPENID_CONNECT_CLIENT_SECRET = 'test_client_secret';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        access_token: 'mock_access_token',
        token_type: 'Bearer',
        expires_in: 3600,
        id_token: 'mock_id_token',
        scope: 'openid profile phone telegram:bot_access',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { authRepository } = await import('@server/modules/auth/auth.repository.ts');

    const result = await authService.handleOidcCallback({
      code: 'valid_code',
      state: 'valid_state',
      redirectUri: 'https://example.com/callback',
    });

    expect(result.success).toBe(true);
    expect(result.token).toBe('token-usr_123');
    expect(authRepository.upsertTelegramUser).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '12345',
        notifyViaTelegram: true,
      })
    );
  });

  it('sends welcome notification to newly registered users when bot_access is granted', async () => {
    process.env.TELEGRAM_OPENID_CONNECT_CLIENT_ID = 'test_client_id';
    process.env.TELEGRAM_OPENID_CONNECT_CLIENT_SECRET = 'test_client_secret';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        access_token: 'mock_access_token',
        token_type: 'Bearer',
        expires_in: 3600,
        id_token: 'mock_id_token',
        scope: 'openid profile telegram:bot_access',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { verifyOidcIdToken } = await import('@shared/utils/auth.ts');
    vi.mocked(verifyOidcIdToken).mockResolvedValueOnce({
      id: 99999,
      sub: '99999',
      name: 'New Customer',
    } as any);

    const { authRepository } = await import('@server/modules/auth/auth.repository.ts');
    vi.mocked(authRepository.upsertTelegramUser).mockResolvedValueOnce({
      ...mockUser,
      id: 'usr_999',
      telegramId: '99999',
      name: 'New Customer',
      notifyViaTelegram: true,
    } as any);

    const { sendMessage } = await import('@server/platform/integrations/telegram/telegramClient.js');

    await authService.handleOidcCallback({
      code: 'new_user_code',
      state: 'valid_state',
      redirectUri: 'https://example.com/callback',
    });

    expect(sendMessage).toHaveBeenCalledWith(
      '99999',
      expect.stringContaining('Welcome to Flavour Bites!')
    );
  });
});
