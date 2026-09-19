import cors, { type CorsOptions } from 'cors';
import { env, isLocalhostUrl } from './env';

function originOf(urlStr: string): string | null {
  try {
    return new URL(urlStr).origin.toLowerCase();
  } catch {
    return null;
  }
}

export function isOriginAllowed(origin: string | undefined): boolean {
  // Allow requests without Origin (same-origin, non-browser clients, Telegram webhooks, curl)
  if (!origin) {
    return true;
  }

  // Development & Test: allow any loopback origin (e.g. localhost:5173, localhost:3000, 127.0.0.1)
  if (env.isDev || env.isTest) {
    if (isLocalhostUrl(origin)) return true;
  }

  // Same-origin: a page served by this server (or its platform origin) requesting
  // its own resources is never a cross-origin request. Browsers control the Origin
  // header, so matching the server's own origin is safe and must not be blocked —
  // e.g. Vite emits `crossorigin` on assets, which sends Origin even for same-origin.
  const ownOrigin = originOf(env.APP_URL);
  if (ownOrigin && originOf(origin) === ownOrigin) {
    return true;
  }

  // Strict check against trusted frontend origin
  const trustedOrigin = originOf(env.FRONTEND_URL);
  return trustedOrigin !== null && originOf(origin) === trustedOrigin;
}

export function createCorsOptions(): CorsOptions {
  return {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        // Deny by omitting CORS headers (browser blocks), not by returning an
        // error — an error would surface as a 500 with the wrong MIME type for
        // static assets requested in CORS mode.
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-csrf-token',
      'x-telegram-bot-api-secret-token',
      'x-requested-with',
    ],
    exposedHeaders: ['x-csrf-token'],
    maxAge: 86400,
  };
}

export const corsConfig = cors(createCorsOptions());
