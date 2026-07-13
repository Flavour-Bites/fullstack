import { getPrisma } from '../../app/config/prisma.js';
import { makeId } from '../../shared/utils/ids.js';
import type { RecoveryStatus } from '@prisma/client';

export const recoveryRepository = {
  async findExisting(oldTelegramId: string, newTelegramId: string) {
    const prisma = getPrisma();
    return prisma.recoveryRequest.findFirst({
      where: {
        oldTelegramId,
        newTelegramId,
        status: 'pending',
      },
    });
  },

  async findById(id: string) {
    const prisma = getPrisma();
    return prisma.recoveryRequest.findUnique({ where: { id } });
  },

  async create(oldTelegramId: string, newTelegramId: string) {
    const prisma = getPrisma();
    return prisma.recoveryRequest.create({
      data: {
        id: makeId('rec'),
        oldTelegramId,
        newTelegramId,
      },
    });
  },

  async findAll(status?: string) {
    const prisma = getPrisma();
    return prisma.recoveryRequest.findMany({
      where: status ? { status: status as RecoveryStatus } : {},
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateStatus(id: string, status: RecoveryStatus) {
    const prisma = getPrisma();
    return prisma.recoveryRequest.update({
      where: { id },
      data: { status },
    });
  },
};
