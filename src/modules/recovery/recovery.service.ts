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
    // TODO: Before approving, verify the requester owns the old Telegram ID
    // by sending a confirmation message to the old account.
    // For now, admin approval is based on manual verification.
    return recoveryRepository.updateStatus(id, status);
  },
};
