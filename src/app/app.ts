import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { webhookCallback } from 'grammy';
import { bot } from '../bot/index.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { securityConfig } from './config/security.js';
import { errorHandler } from './middleware/errorHandler.js';
import { verifyTelegramWebhookSecret } from '../integrations/telegram/telegramWebhook.js';
import { fetchWithTimeout } from '../shared/utils/fetchWithTimeout.js';
import apiRoutes from './routes.js';

export async function registerWebhook() {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.APP_URL || !process.env.TELEGRAM_WEBHOOK_SECRET) {
    console.warn('[Telegram] Webhook env vars missing, skipping registration.');
    return;
  }

  if (!/^[\x21-\x7E]+$/.test(process.env.TELEGRAM_WEBHOOK_SECRET)) {
    console.error('[Telegram] TELEGRAM_WEBHOOK_SECRET contains invalid characters. Use only ASCII printable characters (no spaces, quotes, hashes, backslashes). Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    return;
  }

  const webhookUrl = `${process.env.APP_URL}/bot/webhook`;
  try {
    const res = await fetchWithTimeout(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
      }),
    }, 10_000);
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
  app.use(cookieParser());
  app.use(morgan('combined'));
  app.use(express.json({ limit: '1mb' }));

  // Health check for Render platform monitoring
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

  app.use('/api', apiRoutes);

  app.use(errorHandler);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  return app;
}
