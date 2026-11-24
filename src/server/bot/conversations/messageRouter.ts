import { Bot } from 'grammy';
import { getConversationStore } from '../../platform/integrations/redis/conversationState';
import { handlePriceInput } from './priceConversation';
import { handleOrderWizardStep } from './orderWizard';

const conversationStore = getConversationStore();

export function registerMessageRouter(bot: Bot): void {
  // Handle photo submissions for custom cake reference
  bot.on('message:photo', async (ctx, next) => {
    const senderId = String(ctx.from?.id);
    const conv = await conversationStore.getOrder(senderId);
    if (conv && conv.step === 'designStyle') {
      const photos = ctx.message.photo;
      const largest = photos[photos.length - 1];
      conv.referenceImage = largest.file_id;
      const caption = ctx.message.caption?.trim() || 'Custom photo reference provided';
      await handleOrderWizardStep(ctx, conv, caption, senderId);
      return;
    }
    await next();
  });

  // Handle contact sharing for phone number
  bot.on('message:contact', async (ctx, next) => {
    const senderId = String(ctx.from?.id);
    const conv = await conversationStore.getOrder(senderId);
    if (conv && conv.step === 'contactPhone') {
      const phone = ctx.message.contact.phone_number;
      await handleOrderWizardStep(ctx, conv, phone, senderId);
      return;
    }
    await next();
  });

  bot.on('message:text', async (ctx, next) => {
    const senderId = String(ctx.from?.id);
    const text = ctx.message.text.trim();

    // Check for cancel abort command
    if (text.toLowerCase() === '/cancel' || text.toLowerCase() === 'cancel') {
      await Promise.all([
        conversationStore.clearOrder(senderId),
        conversationStore.clearPrice(senderId),
      ]);
      await ctx.reply('❌ Active request cancelled. Use /order to start a new cake request or /status to check existing orders.', {
        reply_markup: { remove_keyboard: true },
      });
      return;
    }

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
