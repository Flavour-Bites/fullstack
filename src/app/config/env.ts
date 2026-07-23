const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'TELEGRAM_BOT_TOKEN',
  'APP_URL',
  'TELEGRAM_WEBHOOK_SECRET',
  'TELEGRAM_OPENID_CONNECT_CLIENT_ID',
  'TELEGRAM_OPENID_CONNECT_CLIENT_SECRET',
] as const;

const cloudinaryRequired = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
] as const;

const recommended = [
  'GEMINI_API_KEY',
] as const;

const PLACEHOLDER_JWT_SECRETS = new Set([
  'your-jwt-secret-here',
  'changeme',
  'secret',
  'jwt-secret',
  'replace-me',
]);

const PLACEHOLDER_URLS = new Set([
  'MY_APP_URL',
  'changeme',
  'your-app-url',
]);

export function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Copy .env.example to .env and fill in the values.`
    );
  }

  // Validate APP_URL is a real URL
  const appUrl = process.env.APP_URL || '';
  if (PLACEHOLDER_URLS.has(appUrl) || !appUrl.startsWith('http')) {
    throw new Error(
      `APP_URL must be a real URL (e.g. https://flavourbites.com), got: "${appUrl}"`
    );
  }

  // Validate JWT_SECRET is not a placeholder
  const jwtSecret = process.env.JWT_SECRET || '';
  if (PLACEHOLDER_JWT_SECRETS.has(jwtSecret.toLowerCase())) {
    throw new Error(
      'JWT_SECRET must be a strong random string, not a placeholder.\n' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
    );
  }

  // Cloudinary: either CLOUDINARY_URL or all three individual vars required
  const hasUrl = !!process.env.CLOUDINARY_URL;
  const missingCloudinary = cloudinaryRequired.filter((key) => !process.env[key]);
  if (!hasUrl && missingCloudinary.length > 0) {
    throw new Error(
      `Missing Cloudinary configuration: either set CLOUDINARY_URL or all of: ${missingCloudinary.join(', ')}`
    );
  }

  const missingRecommended = recommended.filter((key) => !process.env[key]);
  if (missingRecommended.length > 0) {
    console.warn(`[Env] Missing recommended variables: ${missingRecommended.join(', ')}`);
  }
}
