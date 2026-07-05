import { recoveryRepository } from './recovery.repository.js';
import type { RecoveryStatus } from '@prisma/client';

export const recoveryService = {
  async create(oldTelegramId: string, newTelegramId: string) {
    const existing = await recoveryRepository.findExisting(oldTelegramId, newTelegramId);
    if (existing) {
      return { request: existing, alreadyExists: true };
    }
    const request = await recoveryRepository.create(oldTelegramId, newTelegramId);
    return { request, alreadyExists: false };
  },

  async findAll(status?: string) {
    return recoveryRepository.findAll(status);
  },

  async updateStatus(id: string, status: RecoveryStatus) {
    return recoveryRepository.updateStatus(id, status);
  },
};
