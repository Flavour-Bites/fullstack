import express from 'express';
import path from 'path';
import { webhookCallback } from 'grammy';
import { bot } from '../bot/index.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import {
  corsConfig,
  securityConfig,
  doubleCsrfProtection,
  generateToken,
  isLocalhostUrl,
  env,
} from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { verifyTelegramWebhookSecret } from '../integrations/telegram/telegramWebhook.js';
import { fetchWithTimeout } from '../shared/utils/fetchWithTimeout.js';
import apiRoutes from './routes.js';

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

  app.use(securityConfig);
  app.use(corsConfig);
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));

  // Morgan request logging — skip Vite dev-server requests to avoid log spam
  if (env.isDev) {
    app.use(morgan('dev', { skip: (req) => !req.url.startsWith('/api/') }));
  } else {
    app.use(morgan('combined'));
  }

  // Health check for platform monitoring
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

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

  app.get('/api/csrf-token', (req, res) => {
    res.json({ token: generateToken(req, res) });
  });

  app.use('/api', doubleCsrfProtection, apiRoutes);

  app.use(errorHandler);

  if (env.isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  return app;
}
