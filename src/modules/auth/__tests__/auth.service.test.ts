import { describe, it, expect, vi } from 'vitest';
import { authService } from '../auth.service.js';

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

vi.mock('../../../shared/utils/auth.js', () => ({
  signToken: vi.fn((payload) => `token-${payload.userId}`),
  verifyPassword: vi.fn((plain, hash) => Promise.resolve(hash === `hashed:${plain}`)),
  hashPassword: vi.fn((plain) => Promise.resolve(`hashed:${plain}`)),
  verifyTelegramAuth: vi.fn((data) => data?.id === 12345),
  authCookieOptions: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 999 },
}));

vi.mock('../auth.repository.js', () => ({
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

describe('authService.telegramLogin', () => {
  it('throws when Telegram auth verification fails', async () => {
    await expect(authService.telegramLogin({ id: 99999, auth_date: 0, hash: 'bad' } as any))
      .rejects.toThrow('Telegram sign in failed');
  });

  it('returns token and user for successful login', async () => {
    const result = await authService.telegramLogin({ id: 12345, auth_date: 1000, hash: 'x' } as any);
    expect(result.success).toBe(true);
    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('user');
    expect((result as any).needsPassword).toBeUndefined();
  });
});

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
    const { authRepository } = await import('../auth.repository.js');
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
