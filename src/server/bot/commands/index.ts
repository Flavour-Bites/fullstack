import { Bot } from 'grammy';
import { handleStartCommand } from './start.command';
import { handleStatusCommand } from './status.command';
import { handleOrderCommand } from './order.command';
import { handleHelpCommand } from './help.command';

export function registerCommands(bot: Bot): void {
  bot.command('start', handleStartCommand);
  bot.command('status', handleStatusCommand);
  bot.command('order', handleOrderCommand);
  bot.command('help', handleHelpCommand);
}
