import { getPrisma } from '../../app/config/prisma.js';
import { makeId } from '../../shared/utils/ids.js';
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
    createdAt: user.createdAt?.toISOString?.() ?? '',
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

  async upsertTelegramUser(telegramData: {
    id: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  }) {
    const prisma = getPrisma();
    const displayName = [telegramData.first_name, telegramData.last_name].filter(Boolean).join(' ');

    const user = await prisma.user.upsert({
      where: { telegramId: telegramData.id },
      update: {
        name: displayName || telegramData.username || 'Telegram Customer',
        telegramUsername: telegramData.username ?? null,
        telegramPhoto: telegramData.photo_url ?? null,
      },
      create: {
        id: makeId('usr'),
        name: displayName || telegramData.username || 'Telegram Customer',
        telegramId: telegramData.id,
        telegramUsername: telegramData.username ?? null,
        telegramPhoto: telegramData.photo_url ?? null,
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

  toPublic,
};
