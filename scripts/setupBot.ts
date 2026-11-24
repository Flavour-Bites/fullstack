import 'dotenv/config';
import { setupBotCommandsAndMenu } from '../src/server/bot/index';

async function main() {
  console.log('[SetupBot] Registering bot commands and chat menu button with Telegram...');
  await setupBotCommandsAndMenu();
  console.log('[SetupBot] Successfully configured Telegram bot commands and menu button!');
}

main().catch((err) => {
  console.error('[SetupBot] Failed to configure Telegram bot:', err);
  process.exit(1);
});

