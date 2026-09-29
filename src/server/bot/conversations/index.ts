import { Bot } from 'grammy';
import { registerMessageRouter } from './messageRouter';

export function registerConversations(bot: Bot): void {
  registerMessageRouter(bot);
}

export * from './orderWizard';
export * from './priceConversation';
