import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { webhookCallback } from 'grammy';
import { bot } from '../bot/index';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import {
  corsConfig,
  securityConfig,
  doubleCsrfProtection,
  generateToken,
  isLocalhostUrl,
  env,
} from '../platform/config/index';
import { errorHandler } from '../platform/middleware/errorHandler';
import { verifyTelegramWebhookSecret } from '../platform/integrations/telegram/telegramWebhook';
import { fetchWithTimeout } from '../../shared/utils/fetchWithTimeout';
import apiRoutes from '../api/routes';
import { healthController } from '../api/controllers/health.controller';

export async function registerWebhook() {
  const { TELEGRAM_BOT_TOKEN, APP_URL, TELEGRAM_WEBHOOK_SECRET } = env;

  if (!TELEGRAM_BOT_TOKEN || !APP_URL || !TELEGRAM_WEBHOOK_SECRET) {
    console.warn('[Telegram] Webhook env vars missing, skipping registration.');
    return;
  }

  if (isLocalhostUrl(APP_URL)) {
    console.log('[Telegram] Skipping webhook registration (local dev).');
    return;
  }

  if (!/^[\x21-\x7E]+$/.test(TELEGRAM_WEBHOOK_SECRET)) {
    console.error('[Telegram] TELEGRAM_WEBHOOK_SECRET contains invalid characters. Use only ASCII printable characters (no spaces, quotes, hashes, backslashes). Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    return;
  }

  const webhookUrl = `${APP_URL}/bot/webhook`;
  try {
    const res = await fetchWithTimeout(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: TELEGRAM_WEBHOOK_SECRET,
      }),
    }, 10_000);
    if (!res.ok) throw new Error(`Telegram webhook registration failed: ${res.status}`);
    const data = await res.json();
    if (data.ok) {
      console.log('[Telegram] Webhook registered successfully.');
    } else {
      console.error('[Telegram] Webhook registration failed:', data.description);
    }
  } catch (err) {
    console.error('[Telegram] Webhook registration error:', (err as Error).message);
  }
}

export async function createApp() {
  const app = express();

  // Trust reverse proxy (e.g. Render, Cloudflare) for accurate headers (proto, host, ip)
  app.set('trust proxy', 1);

  app.use(securityConfig);
  app.use(corsConfig);
  app.use(express.json({ limit: '1mb' }));

  // Morgan request logging — skip Vite dev-server requests to avoid log spam
  if (env.isDev) {
    app.use(morgan('dev', { skip: (req) => !req.url.startsWith('/api/') }));
  } else {
    app.use(morgan('combined'));
  }

  // Health check for platform monitoring and backend status
  app.get('/health', healthController.getHealth);
  app.get('/api/health', healthController.getHealth);

  app.post(
    '/bot/webhook',
    (req, res, next) => {
      const actual = req.header('x-telegram-bot-api-secret-token');
      if (!verifyTelegramWebhookSecret(actual)) {
        res.status(401).json({ success: false, error: 'Invalid Telegram webhook secret.' });
        return;
      }
      next();
    },
    webhookCallback(bot, 'express'),
  );

  app.get('/api/csrf-token', cookieParser(), (req, res) => {
    res.json({ token: generateToken(req, res) });
  });

  // The CSRF-protected API surface is the only place cookies are read (JWT in
  // the auth cookie + the csrf-token double-submit cookie), so cookie parsing
  // is scoped to /api rather than the whole app. Non-API handlers (health,
  // the secret-token-verified Telegram webhook, static content) never touch
  // cookies, which keeps request handlers not guarded by CSRF free of cookie
  // middleware (least privilege). doubleCsrfProtection ignores GET/HEAD/OPTIONS
  // and rejects unsafe requests that lack a valid x-csrf-token.
  app.use('/api', cookieParser(), doubleCsrfProtection, apiRoutes);

  app.use(errorHandler);

  if (env.isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else if (env.isPreview) {
    // Preview serves the built SPA + API from one origin, so a single public
    // https tunnel reproduces the deployed topology end to end (this is how the
    // production auth path — OIDC redirects, cookies, CSRF — is exercised
    // locally). Production stays API-only; Vercel serves the SPA there.
    const distClient = path.resolve(process.cwd(), 'dist/client');
    const indexHtml = path.join(distClient, 'index.html');
    if (existsSync(indexHtml)) {
      app.use(express.static(distClient));
      // SPA fallback for navigation, JSON 404 for anything API/bot-ish or mutating.
      app.use((req, res, next) => {
        if (req.path.startsWith('/api/') || req.path.startsWith('/bot/')) {
          res.status(404).json({ success: false, error: 'Not found.' });
          return;
        }
        if (req.method === 'GET' || req.method === 'HEAD') {
          res.sendFile(indexHtml);
          return;
        }
        next();
      });
    } else {
      console.warn(
        '[Preview] dist/client/index.html not found — run `npm run build`, then start preview.'
      );
      app.use((_req, res) => {
        res.status(404).json({ success: false, error: 'Not found.' });
      });
    }
  } else {
    // Backend-only in production. The frontend is a separate service (Vercel),
    // so this server never serves static assets. Unmatched non-API routes get
    // a clean JSON 404 instead of an HTML page.
    app.use((_req, res) => {
      res.status(404).json({ success: false, error: 'Not found.' });
    });
  }

  return app;
}
