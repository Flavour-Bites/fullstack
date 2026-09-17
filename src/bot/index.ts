import { Bot } from 'grammy';
import { env } from '../app/config/env.js';
import { handleCommands } from './commands.js';
import { handleCallbacks } from './callbacks.js';
import { handleInline } from './inline.js';

export const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

handleCommands(bot);
handleCallbacks(bot);
handleInline(bot);

bot.catch((err) => {
  console.error('[Bot] Unhandled error:', err.message);
});
