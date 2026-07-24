import { describe, it, expect, vi } from 'vitest';
import { verifyTelegramWebhookSecret } from '@/integrations/telegram/telegramWebhook.js';

describe('verifyTelegramWebhookSecret', () => {
  it('returns true for matching secret', () => {
    vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', 'my_secret_token_123');
    expect(verifyTelegramWebhookSecret('my_secret_token_123')).toBe(true);
    vi.unstubAllEnvs();
  });

  it('returns false for mismatched secret', () => {
    vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', 'my_secret_token_123');
    expect(verifyTelegramWebhookSecret('wrong_secret')).toBe(false);
    vi.unstubAllEnvs();
  });

  it('returns false for undefined actual', () => {
    vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', 'my_secret_token_123');
    expect(verifyTelegramWebhookSecret(undefined)).toBe(false);
    vi.unstubAllEnvs();
  });

  it('returns false when env is not set', () => {
    vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', '');
    expect(verifyTelegramWebhookSecret('some_token')).toBe(false);
    vi.unstubAllEnvs();
  });
});
