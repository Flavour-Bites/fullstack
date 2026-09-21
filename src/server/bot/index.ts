import { Bot } from 'grammy';
import { env } from '../platform/config/env';
import { handleCommands } from './commands';
import { handleCallbacks } from './callbacks';
import { handleInline } from './inline';

let bot: Bot | undefined;

// Built lazily so importing this module (and anything that imports the app
// stack) has no env-dependent side effects. Production fail-fast is preserved:
// server.ts runs validateEnv() before createApp(), so a missing token is
// reported there — never as a cryptic grammy "Empty token!" during import.
export function getBot(): Bot {
  if (!bot) {
    bot = new Bot(env.TELEGRAM_BOT_TOKEN);
    handleCommands(bot);
    handleCallbacks(bot);
    handleInline(bot);

    bot.catch((err) => {
      console.error('[Bot] Unhandled error:', err.message);
    });
  }
  return bot;
}
