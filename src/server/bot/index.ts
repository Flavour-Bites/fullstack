import { Bot } from 'grammy';
import { env } from '../platform/config/env';
import { handleCommands } from './commands';
import { handleCallbacks } from './callbacks';
import { handleInline } from './inline';

export const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

handleCommands(bot);
handleCallbacks(bot);
handleInline(bot);

bot.catch((err) => {
  console.error('[Bot] Unhandled error:', err.message);
});
