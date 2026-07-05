import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { webhookCallback } from 'grammy';
import { bot } from '../bot/index.js';
import cookieParser from 'cookie-parser';
import { securityConfig } from './config/security.js';
import { errorHandler } from './middleware/errorHandler.js';
import { verifyTelegramWebhookSecret } from '../integrations/telegram/telegramWebhook.js';
import apiRoutes from './routes.js';

export async function createApp() {
  const app = express();

  app.use(securityConfig);
  app.use(cookieParser());
  app.use(express.json({ limit: '12mb' }));

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.APP_URL && process.env.TELEGRAM_WEBHOOK_SECRET) {
    const webhookUrl = `${process.env.APP_URL}/bot/webhook`;
    fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
      }),
    }).catch((err) => console.error('[Telegram] Webhook registration failed:', err.message));
  }

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
