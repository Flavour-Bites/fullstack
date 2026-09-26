export type AppEnvKind = 'development' | 'preview' | 'production' | 'test';

export interface CookiePolicy {
  readonly secure: boolean;
  readonly sameSite: 'none' | 'lax';
}

/**
 * Normalize an arbitrary NODE_ENV value. Unknown or missing values fall back to
 * 'development' so local tooling never accidentally behaves like a deployment.
 */
export function normalizeAppEnv(value?: string): AppEnvKind {
  const normalized = (value || '').trim().toLowerCase();
  return normalized === 'production' || normalized === 'preview' || normalized === 'test'
    ? normalized
    : 'development';
}

export interface AppEnv {
  readonly NODE_ENV: AppEnvKind;
  readonly APP_ENV: AppEnvKind;
  readonly isDev: boolean;
  readonly isPreview: boolean;
  readonly isProd: boolean;
  readonly isTest: boolean;
  /** Local, relaxed environments (development/test): loopback origins and Vite-style relaxations are allowed here. */
  readonly isRelaxed: boolean;
  /** APP_URL points at a loopback host (localhost/127.0.0.1). */
  readonly isLocal: boolean;
  /** Frontend and API are served from different origins (cross-site cookie rules apply). */
  readonly isCrossSite: boolean;
  /** Cookie attributes derived from topology (https + cross-site), not from NODE_ENV. */
  readonly cookiePolicy: CookiePolicy;
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
  readonly REDIS_PRICE_TTL_SECONDS: number;
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

export function originOfUrl(urlStr: string): string | null {
  try {
    return new URL(urlStr).origin.toLowerCase();
  } catch {
    return null;
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

export function isHttpsUrl(urlStr: string): boolean {
  try {
    return new URL(urlStr).protocol === 'https:';
  } catch {
    return false;
  }
}

export function isRenderDomain(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();
    return hostname === 'onrender.com' || hostname.endsWith('.onrender.com');
  } catch {
    return false;
  }
}

/**
 * Opt-in that lets the production server run against local (loopback)
 * services — used by the docker-compose production mimic. Off by default so
 * real deployments still fail loudly when APP_URL points at localhost.
 */
function isLoopbackAppUrlAllowed(): boolean {
  return process.env.ALLOW_LOOPBACK_APP_URL === 'true';
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
  const nodeEnv = normalizeAppEnv(process.env.NODE_ENV);
  const isProd = nodeEnv === 'production';
  const isPlatform = nodeEnv === 'production' || nodeEnv === 'preview';

  // If deployed on Render and APP_URL is unset, loopback, or an outdated render
  // domain, fall back to the platform-injected URL. Production-only: preview
  // deployments must be explicit about where they live.
  if (isProd && !isLoopbackAppUrlAllowed() && (isLocalhostUrl(appUrl) || !appUrl || PLACEHOLDER_URLS.has(appUrl) || (isRenderDomain(appUrl) && Boolean(process.env.RENDER_EXTERNAL_URL) && appUrl !== process.env.RENDER_EXTERNAL_URL))) {
    const platformUrl = process.env.RENDER_EXTERNAL_URL ||
      (process.env.RENDER_EXTERNAL_HOSTNAME ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : null);
    if (platformUrl) {
      appUrl = platformUrl;
      process.env.APP_URL = platformUrl;
    }
  }

  const isLocal = isLocalhostUrl(appUrl);

  // Development and test may live on loopback; any deployment (preview,
  // production) must point at a real, public URL unless explicitly overridden.
  if (PLACEHOLDER_URLS.has(appUrl) || (isPlatform && isLocal && !isLoopbackAppUrlAllowed())) {
    throw new Error(
      `In production, APP_URL must be a real URL (e.g. https://flavourbites.com), got: "${appUrl}"\n` +
      (isPlatform && isLocal
        ? 'Local preview stacks can set ALLOW_LOOPBACK_APP_URL=true (see .local/docker-compose.yml).\n'
        : '')
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

  // Cloudinary: either CLOUDINARY_URL or all three individual vars required (skip in dev/test)
  const isDevOrTest = nodeEnv === 'development' || nodeEnv === 'test';
  if (!isDevOrTest) {
    const hasUrl = !!process.env.CLOUDINARY_URL;
    const missingCloudinary = cloudinaryRequired.filter((key) => !process.env[key]);
    if (!hasUrl && missingCloudinary.length > 0) {
      throw new Error(
        `Missing Cloudinary configuration: either set CLOUDINARY_URL or all of: ${missingCloudinary.join(', ')}`
      );
    }
  }

  const missingRecommended = recommended.filter((key) => !process.env[key]);
  if (missingRecommended.length > 0) {
    console.warn(`[Env] Missing recommended variables: ${missingRecommended.join(', ')}`);
  }
}

export function getEnv(): AppEnv {
  const nodeEnv = normalizeAppEnv(process.env.NODE_ENV);
  const isDev = nodeEnv === 'development';
  const isProd = nodeEnv === 'production';
  const isTest = nodeEnv === 'test';
  const isPreview = nodeEnv === 'preview';

  let appUrl = (process.env.APP_URL || '').replace(/^["']|["']$/g, '').trim();
  if (isProd && !isLoopbackAppUrlAllowed() && (isLocalhostUrl(appUrl) || !appUrl || PLACEHOLDER_URLS.has(appUrl) || (isRenderDomain(appUrl) && Boolean(process.env.RENDER_EXTERNAL_URL) && appUrl !== process.env.RENDER_EXTERNAL_URL))) {
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

  const isHttps = isHttpsUrl(appUrl);
  const isCrossSite = originOfUrl(appUrl) !== originOfUrl(frontendUrl);

  return {
    NODE_ENV: nodeEnv,
    APP_ENV: nodeEnv,
    isDev,
    isPreview,
    isProd,
    isTest,
    isRelaxed: isDev || isTest,
    isLocal: isLocalhostUrl(appUrl),
    isCrossSite,
    cookiePolicy: {
      // 'none' is only necessary (and only ever valid) cross-site over https.
      sameSite: isCrossSite && isHttps ? 'none' : 'lax',
      secure: isHttps,
    },
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
    REDIS_PRICE_TTL_SECONDS: Number(process.env.REDIS_PRICE_TTL_SECONDS || 60 * 30),
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
