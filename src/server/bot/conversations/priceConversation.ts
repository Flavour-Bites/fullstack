import { Context } from 'grammy';
import { getConversationStore } from '../../platform/integrations/redis/conversationState';
import { ordersService } from '../../modules/orders/orders.service';
import { resolveTelegramUser, isStaffUser } from '../botHelpers';
import { notifyCustomerStatusChange } from '../../platform/integrations/telegram/telegramNotifications';

const conversationStore = getConversationStore();

export async function handlePriceInput(
  ctx: Context,
  senderId: string,
  text: string
): Promise<boolean> {
  const pendingPrice = await conversationStore.getPrice(senderId);
  const orderId = pendingPrice?.orderId;
  if (!orderId) {
    return false;
  }

  const normalized = text.trim().toLowerCase();
  if (normalized === '/cancel' || normalized === 'cancel') {
    await conversationStore.clearPrice(senderId);
    await ctx.reply('❌ Price entry cancelled.', { parse_mode: 'HTML' });
    return true;
  }

  const priceRaw = text.replace(/\D/g, '');
  const price = Number.parseInt(priceRaw, 10);

  if (Number.isNaN(price) || price < 50 || price > 100000) {
    await ctx.reply(
      '⚠️ Please enter a valid price in ETB (e.g. <code>4500</code>).\nSend <code>/cancel</code> to abort.',
      { parse_mode: 'HTML' }
    );
    return true;
  }

  const user = await resolveTelegramUser(ctx);
  if (!isStaffUser(user)) {
    await conversationStore.clearPrice(senderId);
    await ctx.reply('⚠️ Only staff or admin accounts can set cake prices.', { parse_mode: 'HTML' });
    return true;
  }

  try {
    await ordersService.update(
      orderId,
      { price, status: 'Priced' },
      {
        source: 'telegram_bot',
        userId: user!.id,
      }
    );

    await conversationStore.clearPrice(senderId);

    // Notify customer that the price has been submitted
    notifyCustomerStatusChange(orderId).catch((err: Error) =>
      console.error('[Notify] Customer price notice failed:', err.message)
    );

    await ctx.reply(
      `✅ Price of <b>${price.toLocaleString()} ETB</b> sent to the customer for order <code>${orderId}</code>.\n\nThey've received a notification with Accept/Revise options.`,
      { parse_mode: 'HTML' }
    );
  } catch (err: any) {
    await ctx.reply(`⚠️ Failed to set price: ${err.message || 'Unknown error'}`);
  }

  return true;
}
