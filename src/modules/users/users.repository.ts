import { getPrisma } from '../../app/config/prisma.js';
import type { Role } from '@prisma/client';

export const usersRepository = {
  async findAll() {
    const prisma = getPrisma();
    return prisma.user.findMany({
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
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
  },

  async countByRole(role: Role) {
    const prisma = getPrisma();
    return prisma.user.count({ where: { role } });
  },

  async updateRole(userId: string, role: Role) {
    const prisma = getPrisma();
    return prisma.user.update({ where: { id: userId }, data: { role } });
  },

  async delete(userId: string) {
    const prisma = getPrisma();
    return prisma.user.delete({ where: { id: userId } });
  },
};
