import {
  signToken,
  verifyPassword,
  hashPassword,
  verifyTelegramAuth,
  authCookieOptions,
} from '../../shared/utils/auth.js';
import { authRepository } from './auth.repository.js';
import type { TelegramAuthData } from '../../shared/utils/auth.js';
import type { LoginResponse } from './auth.types.js';

export const authService = {
  async telegramLogin(telegramData: TelegramAuthData): Promise<LoginResponse> {
    if (!verifyTelegramAuth(telegramData)) {
      throw new Error('Telegram sign in failed. Please try again.');
    }

    const user = await authRepository.upsertTelegramUser({
      id: String(telegramData.id),
      first_name: telegramData.first_name,
      last_name: telegramData.last_name,
      username: telegramData.username,
      photo_url: telegramData.photo_url,
    });

    if (user.passwordHash) {
      return { success: true, needsPassword: true, telegramId: String(telegramData.id) };
    }

    const token = signToken({ userId: user.id, role: user.role });
    return {
      success: true,
      token,
      user: authRepository.toPublic(user),
    };
  },

  async finalizeTelegramLogin(telegramId: string, password: string): Promise<LoginResponse> {
    const user = await authRepository.findByTelegramId(telegramId);
    if (!user) throw new Error('Account not found.');

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw new Error('That password is not correct.');

    const token = signToken({ userId: user.id, role: user.role });
    return { success: true, token, user: authRepository.toPublic(user) };
  },

  async setPassword(userId: string, password: string): Promise<void> {
    const hashed = await hashPassword(password);
    await authRepository.updatePassword(userId, hashed);
  },

  async verifyUserPassword(userId: string, password: string): Promise<boolean> {
    const user = await authRepository.findById(userId);
    return verifyPassword(password, user?.passwordHash);
  },

  async telegramPasswordLogin(telegramId: string, password: string): Promise<LoginResponse> {
    const user = await authRepository.findByTelegramId(telegramId);
    if (!user) throw new Error('Account not found.');

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw new Error('That Telegram ID or password is not correct.');

    const token = signToken({ userId: user.id, role: user.role });
    return { success: true, token, user: authRepository.toPublic(user) };
  },

  async getCurrentUser(userId: string): Promise<LoginResponse['user']> {
    const user = await authRepository.findById(userId);
    if (!user) throw new Error('Account not found.');
    return authRepository.toPublic(user);
  },

  authCookieOptions,
};
