import { getPrisma } from '../../platform/config/prisma';
import { makeId } from '../../../shared/utils/ids';
import type { User, Role } from '@prisma/client';

export type PublicUser = {
  id: string;
  name: string;
  role: Role;
  telegramId: string;
  telegramUsername: string | null;
  telegramPhone: string | null;
  telegramPhoto: string | null;
  notifyViaTelegram: boolean;
  dietaryPreferences: string[];
  language: string;
  createdAt: string;
};

function toPublic(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    telegramId: user.telegramId,
    telegramUsername: user.telegramUsername,
    telegramPhone: user.telegramPhone,
    telegramPhoto: user.telegramPhoto,
    notifyViaTelegram: user.notifyViaTelegram,
    dietaryPreferences: user.dietaryPreferences ?? [],
    language: user.language ?? 'en',
    createdAt: user.createdAt?.toISOString() ?? '',
  };
}

export const authRepository = {
  async findByTelegramId(telegramId: string) {
    const prisma = getPrisma();
    return prisma.user.findFirst({ where: { telegramId, deletedAt: null } });
  },

  async findById(id: string) {
    const prisma = getPrisma();
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  },

  async upsertTelegramUser(data: {
    id: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    phone_number?: string;
  }) {
    const prisma = getPrisma();
    const displayName = data.name || [data.first_name, data.last_name].filter(Boolean).join(' ');

    const user = await prisma.user.upsert({
      where: { telegramId: data.id },
      update: {
        name: displayName || data.username || 'Telegram Customer',
        telegramUsername: data.username ?? null,
        telegramPhoto: data.photo_url ?? null,
        ...(data.phone_number ? { telegramPhone: data.phone_number } : {}),
      },
      create: {
        id: makeId('usr'),
        name: displayName || data.username || 'Telegram Customer',
        telegramId: data.id,
        telegramUsername: data.username ?? null,
        telegramPhoto: data.photo_url ?? null,
        telegramPhone: data.phone_number ?? null,
        role: 'customer',
      },
    });
    return user;
  },

  async updatePassword(userId: string, passwordHash: string) {
    const prisma = getPrisma();
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },

  async updateProfile(userId: string, data: { name?: string; telegramPhone?: string; notifyViaTelegram?: boolean; dietaryPreferences?: string[]; language?: string; }) {
    const prisma = getPrisma();
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  },

  toPublic,
};
