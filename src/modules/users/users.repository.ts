import { getPrisma } from '../../app/config/prisma.js';
import type { Role } from '@prisma/client';

export const usersRepository = {
  async findAll() {
    const prisma = getPrisma();
    return prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        role: true,
        telegramId: true,
        telegramUsername: true,
        telegramPhone: true,
        notifyViaTelegram: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(userId: string) {
    const prisma = getPrisma();
    return prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, role: true },
    });
  },

  async countByRole(role: Role) {
    const prisma = getPrisma();
    return prisma.user.count({ where: { role, deletedAt: null } });
  },

  async updateRole(userId: string, role: Role) {
    const prisma = getPrisma();
    return prisma.user.update({ where: { id: userId }, data: { role } });
  },

  async delete(userId: string) {
    const prisma = getPrisma();
    return prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  },
};
