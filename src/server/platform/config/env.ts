export interface AppEnv {
  readonly NODE_ENV: 'development' | 'production' | 'test';
  readonly isDev: boolean;
  readonly isProd: boolean;
  readonly isTest: boolean;
  readonly PORT: number;
  readonly DATABASE_URL: string;
  readonly JWT_SECRET: string;
  readonly CSRF_SECRET: string;
  readonly APP_URL: string;
  readonly FRONTEND_URL: string;
  readonly TELEGRAM_BOT_TOKEN: string;
  readonly TELEGRAM_WEBHOOK_SECRET: string;
  readonly TELEGRAM_OPENID_CONNECT_CLIENT_ID: string;
  readonly TELEGRAM_OPENID_CONNECT_CLIENT_SECRET: string;
  readonly TELEGRAM_STAFF_CHAT_ID?: string;
  readonly CLOUDINARY_CLOUD_NAME?: string;
  readonly CLOUDINARY_API_KEY?: string;
  readonly CLOUDINARY_API_SECRET?: string;
  readonly CLOUDINARY_URL?: string;
  readonly CLOUDINARY_UPLOAD_FOLDER: string;
  readonly GEMINI_API_KEY?: string;
  readonly REDIS_URL?: string;
  readonly REDIS_CONVERSATION_TTL_SECONDS: number;
  readonly REDIS_QUOTE_TTL_SECONDS: number;
}

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

const LOOPBACK_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '[::1]',
  '0.0.0.0',
]);

export function isLocalhostUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return LOOPBACK_HOSTNAMES.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function isValidHttpUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateEnv(): void {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Copy .env.example to .env and fill in the values.`
    );
  }

  // Validate APP_URL is a real URL
  let appUrl = (process.env.APP_URL || '').replace(/^["']|["']$/g, '').trim();
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isDev = nodeEnv !== 'production';

  // If deployed on Render or other platforms with automatic URL injection and APP_URL is unset, loopback, or an outdated render domain
  if (!isDev && (isLocalhostUrl(appUrl) || !appUrl || PLACEHOLDER_URLS.has(appUrl) || (appUrl.includes('.onrender.com') && Boolean(process.env.RENDER_EXTERNAL_URL) && appUrl !== process.env.RENDER_EXTERNAL_URL))) {
    const platformUrl = process.env.RENDER_EXTERNAL_URL ||
      (process.env.RENDER_EXTERNAL_HOSTNAME ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : null);
    if (platformUrl) {
      appUrl = platformUrl;
      process.env.APP_URL = platformUrl;
    }
  }

  const isLocal = isLocalhostUrl(appUrl);

  if (PLACEHOLDER_URLS.has(appUrl) || (!isDev && isLocal)) {
    throw new Error(
      `In production, APP_URL must be a real URL (e.g. https://flavourbites.com), got: "${appUrl}"`
    );
  }

  if (!isValidHttpUrl(appUrl)) {
    throw new Error(`APP_URL must start with http:// or https://, got: "${appUrl}"`);
  }

  // Validate FRONTEND_URL if explicitly provided
  const frontendUrl = (process.env.FRONTEND_URL || '').replace(/^["']|["']$/g, '').trim();
  if (frontendUrl && !isValidHttpUrl(frontendUrl)) {
    throw new Error(`FRONTEND_URL must start with http:// or https://, got: "${frontendUrl}"`);
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

export function getEnv(): AppEnv {
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  const isDev = nodeEnv === 'development';
  const isProd = nodeEnv === 'production';
  const isTest = nodeEnv === 'test';

  let appUrl = (process.env.APP_URL || '').replace(/^["']|["']$/g, '').trim();
  if (isProd && (isLocalhostUrl(appUrl) || !appUrl || PLACEHOLDER_URLS.has(appUrl) || (appUrl.includes('.onrender.com') && Boolean(process.env.RENDER_EXTERNAL_URL) && appUrl !== process.env.RENDER_EXTERNAL_URL))) {
    const platformUrl = process.env.RENDER_EXTERNAL_URL ||
      (process.env.RENDER_EXTERNAL_HOSTNAME ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : null);
    if (platformUrl) {
      appUrl = platformUrl;
      process.env.APP_URL = platformUrl;
    }
  }
  appUrl = appUrl || 'http://localhost:3000';

  let frontendUrl = (process.env.FRONTEND_URL || '').replace(/^["']|["']$/g, '').trim();
  if (!frontendUrl) {
    frontendUrl = appUrl;
  }
  const jwtSecret = process.env.JWT_SECRET || '';
  const csrfSecret = process.env.CSRF_SECRET || jwtSecret;

  return {
    NODE_ENV: nodeEnv,
    isDev,
    isProd,
    isTest,
    PORT: Number(process.env.PORT || 3000),
    DATABASE_URL: process.env.DATABASE_URL || '',
    JWT_SECRET: jwtSecret,
    CSRF_SECRET: csrfSecret,
    APP_URL: appUrl,
    FRONTEND_URL: frontendUrl,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    TELEGRAM_WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET || '',
    TELEGRAM_OPENID_CONNECT_CLIENT_ID: process.env.TELEGRAM_OPENID_CONNECT_CLIENT_ID || '',
    TELEGRAM_OPENID_CONNECT_CLIENT_SECRET: process.env.TELEGRAM_OPENID_CONNECT_CLIENT_SECRET || '',
    TELEGRAM_STAFF_CHAT_ID: process.env.TELEGRAM_STAFF_CHAT_ID,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_URL: process.env.CLOUDINARY_URL,
    CLOUDINARY_UPLOAD_FOLDER: process.env.CLOUDINARY_UPLOAD_FOLDER || 'flavour-bites',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    REDIS_URL: process.env.REDIS_URL,
    REDIS_CONVERSATION_TTL_SECONDS: Number(process.env.REDIS_CONVERSATION_TTL_SECONDS || 60 * 60 * 24),
    REDIS_QUOTE_TTL_SECONDS: Number(process.env.REDIS_QUOTE_TTL_SECONDS || 60 * 30),
  };
}

/**
 * Strongly-typed environment configuration singleton.
 * Reflects validated environment state.
 */
export const env: AppEnv = new Proxy({} as AppEnv, {
  get: (_target, prop: string | symbol) => {
    const current = getEnv();
    return (current as any)[prop];
  },
});
