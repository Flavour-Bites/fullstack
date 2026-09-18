import crypto from 'crypto';
import { env } from '../../config/env';

export function verifyTelegramWebhookSecret(actual: string | undefined): boolean {
  const expected = env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected || !actual) return false;
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}
