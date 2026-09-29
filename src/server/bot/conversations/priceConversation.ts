import { Context } from 'grammy';
import { getConversationStore } from '../../platform/integrations/redis/conversationState';
import { ordersRepository } from '../../modules/orders/orders.repository';
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

  const priceRaw = text.replace(/\D/g, '');
  const price = Number.parseInt(priceRaw, 10);

  if (Number.isNaN(price) || price < 50 || price > 100000) {
    await ctx.reply(
      '⚠️ Please enter a valid price in ETB (e.g. <code>4500</code>).',
      { parse_mode: 'HTML' }
    );
    return true;
  }

  await ordersRepository.updateCommercials(orderId, { price });
  await ordersRepository.updateStatus(orderId, 'Priced', {
    source: 'telegram_bot',
    userId: senderId,
  });

  await conversationStore.clearPrice(senderId);

  await notifyCustomerStatusChange(orderId);

  await ctx.reply(
    `✅ Price of <b>${price.toLocaleString()} ETB</b> sent to the customer for order <code>${orderId}</code>.\n\nThey'll receive a notification with Accept/Change buttons.`,
    { parse_mode: 'HTML' }
  );

  return true;
}
