import { Bot } from 'grammy';
import { getConversationStore } from '../../platform/integrations/redis/conversationState';
import { handlePriceInput } from './priceConversation';
import { handleOrderWizardStep } from './orderWizard';

const conversationStore = getConversationStore();

export function registerMessageRouter(bot: Bot): void {
  bot.on('message:text', async (ctx, next) => {
    const senderId = String(ctx.from?.id);
    const text = ctx.message.text.trim();

    // 1. Check if sender is a staff member providing a price
    const handledPrice = await handlePriceInput(ctx, senderId, text);
    if (handledPrice) {
      return;
    }

    // 2. Check if sender is a customer in an active order wizard
    const conv = await conversationStore.getOrder(senderId);
    if (conv) {
      const handledOrder = await handleOrderWizardStep(ctx, conv, text, senderId);
      if (handledOrder) {
        return;
      }
    }

    // If neither conversation applies, pass to subsequent middleware
    await next();
  });
}
