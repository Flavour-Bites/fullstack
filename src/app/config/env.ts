const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'TELEGRAM_BOT_TOKEN',
  'APP_URL',
  'TELEGRAM_WEBHOOK_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
] as const;

const recommended = [
  'GEMINI_API_KEY',
] as const;

export function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Copy .env.example to .env and fill in the values.`
    );
  }

  const missingRecommended = recommended.filter((key) => !process.env[key]);
  if (missingRecommended.length > 0) {
    console.warn(`[Env] Missing recommended variables: ${missingRecommended.join(', ')}`);
  }
}
