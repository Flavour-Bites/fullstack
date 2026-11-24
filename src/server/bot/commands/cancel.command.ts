import { CommandContext, Context } from 'grammy';
import { getConversationStore } from '../../platform/integrations/redis/conversationState';

const conversationStore = getConversationStore();

export async function handleCancelCommand(ctx: CommandContext<Context>): Promise<void> {
  const telegramId = String(ctx.from?.id);

  await Promise.all([
    conversationStore.clearOrder(telegramId),
    conversationStore.clearPrice(telegramId),
  ]);

  await ctx.reply('❌ Active order request or action cancelled.\n\nUse /order to start a new cake request or /status to check existing orders.', {
    reply_markup: { remove_keyboard: true },
  });
}

