import { Bot } from 'grammy';
import { handleCommands } from './commands.js';
import { handleCallbacks } from './callbacks.js';
import { handleInline } from './inline.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

export const bot = new Bot(BOT_TOKEN);

handleCommands(bot);
handleCallbacks(bot);
handleInline(bot);

bot.catch((err) => {
  console.error('[Bot] Unhandled error:', err.message);
});
