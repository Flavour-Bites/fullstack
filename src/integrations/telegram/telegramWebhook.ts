export function verifyTelegramWebhookSecret(actual: string | undefined): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return false;
  if (!actual) return false;
  return actual === expected;
}
