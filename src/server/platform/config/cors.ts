import cors, { type CorsOptions } from 'cors';
import { env, isLocalhostUrl } from './env';

export function isOriginAllowed(origin: string | undefined): boolean {
  // Allow requests without Origin (same-origin, non-browser clients, Telegram webhooks, curl)
  if (!origin) {
    return true;
  }

  // Development & Test: allow any loopback origin (e.g. localhost:5173, localhost:3000, 127.0.0.1)
  if (env.isDev || env.isTest) {
    if (isLocalhostUrl(origin)) {
      return true;
    }
  }

  // Strict check against trusted frontend origin
  try {
    const trustedOrigin = new URL(env.FRONTEND_URL).origin.toLowerCase();
    const requestOrigin = new URL(origin).origin.toLowerCase();
    return requestOrigin === trustedOrigin;
  } catch {
    return false;
  }
}

export function createCorsOptions(): CorsOptions {
  return {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy blocked access from origin: ${origin}`));
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
