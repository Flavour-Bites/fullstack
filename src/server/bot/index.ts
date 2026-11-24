import { Bot } from 'grammy';
import { env } from '../platform/config/env';
import { registerCommands } from './commands';
import { registerConversations } from './conversations';
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
    registerCommands(bot);
    registerConversations(bot);
    handleCallbacks(bot);
    handleInline(bot);

    bot.catch(async (err) => {
      console.error('[Bot] Unhandled error:', err.message);
      try {
        if (err.ctx) {
          await err.ctx.reply('⚠️ An unexpected error occurred. Please try again or use /help.', {
            parse_mode: 'HTML',
          });
        }
      } catch {
        // Ignore reply failures in error handler
      }
    });
  }
  return bot;
}

export async function setupBotCommandsAndMenu(botInstance: Bot = getBot()): Promise<void> {
  await botInstance.api.setMyCommands([
    { command: 'start', description: 'Welcome and main menu' },
    { command: 'order', description: 'Start a new custom cake order' },
    { command: 'status', description: 'Check your active orders' },
    { command: 'cancel', description: 'Cancel current request or action' },
    { command: 'help', description: 'Bot commands and bakery info' },
  ]);

  if (env.FRONTEND_URL && env.FRONTEND_URL.startsWith('https://')) {
    await botInstance.api.setChatMenuButton({
      menu_button: {
        type: 'web_app',
        text: 'Bakery Menu 🍰',
        web_app: { url: env.FRONTEND_URL },
      },
    });
  } else {
    await botInstance.api.setChatMenuButton({
      menu_button: { type: 'default' },
    });
  }
}
