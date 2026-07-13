import { recoveryRepository } from './recovery.repository.js';
import { sendMessage } from '../../integrations/telegram/telegramClient.js';
import type { RecoveryStatus } from '@prisma/client';

export const recoveryService = {
  async create(oldTelegramId: string, newTelegramId: string) {
    const existing = await recoveryRepository.findExisting(oldTelegramId, newTelegramId);
    if (existing) {
      return { request: existing, alreadyExists: true };
    }
    const request = await recoveryRepository.create(oldTelegramId, newTelegramId);

    // Notify the old account that a recovery was requested
    await sendMessage(
      oldTelegramId,
      '🔒 <b>Account Recovery Request</b>\n\n' +
      'Someone requested to recover your Flavour Bites account.\n\n' +
      'If this was you, please confirm with your admin.\n' +
      'If this was NOT you, contact support immediately.'
    );

    return { request, alreadyExists: false };
  },

  async findAll(status?: string) {
    return recoveryRepository.findAll(status);
  },

  async updateStatus(id: string, status: RecoveryStatus) {
    // Before approving, notify the old account for verification
    if (status === 'approved') {
      const request = await recoveryRepository.findById(id);
      if (request) {
        await sendMessage(
          request.oldTelegramId,
          '✅ <b>Account Recovery Approved</b>\n\n' +
          'Your account has been recovered. You can now log in with your new Telegram account.'
        );
      }
    }
    return recoveryRepository.updateStatus(id, status);
  },
};
