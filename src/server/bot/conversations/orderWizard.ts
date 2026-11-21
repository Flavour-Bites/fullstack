import { Context } from 'grammy';
import { ordersRepository } from '../../modules/orders/orders.repository';
import { notifyStaffNewOrder } from '../../platform/integrations/telegram/telegramNotifications';
import { getConversationStore } from '../../platform/integrations/redis/conversationState';
import { formatRequestDate } from '../../../shared/utils/dateFormat';
import { makeOrderId } from '../../../shared/utils/ids';
import { businessAvailabilityService } from '../../modules/business/businessAvailability.service';
import type { OrderConversation, OrderWizardStep } from '../types';

const conversationStore = getConversationStore();

type WizardHandler = (
  ctx: Context,
  conv: OrderConversation,
  text: string,
  telegramId: string
) => Promise<void>;

const stepHandlers: Record<OrderWizardStep, WizardHandler> = {
  eventType: async (ctx, conv, text, telegramId) => {
    conv.eventType = text;
    conv.step = 'eventDate';
    await conversationStore.setOrder(telegramId, conv);
    await ctx.reply(
      `Great, a <b>${text}</b> cake! 🎉\n\n<b>2.</b> What date do you need it by?\n` +
        `(e.g., July 15, 2026)`,
      { parse_mode: 'HTML' }
    );
  },

  eventDate: async (ctx, conv, text, telegramId) => {
    const validation = await businessAvailabilityService.validateOrderDate(text);

    if (!validation.valid) {
      await ctx.reply(
        `⚠️ ${validation.error}\n\nPlease enter a valid date (e.g., July 15, 2026):`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    conv.eventDate = text;
    conv.step = 'guestCount';
    await conversationStore.setOrder(telegramId, conv);
    await ctx.reply(
      `📅 <b>${text}</b> — noted!\n\n<b>3.</b> How many guests will the cake serve?`,
      { parse_mode: 'HTML' }
    );
  },

  guestCount: async (ctx, conv, text, telegramId) => {
    const count = Number.parseInt(text, 10);
    if (Number.isNaN(count) || count < 1) {
      await ctx.reply('⚠️ Please enter a valid number of guests (e.g. 25).');
      return;
    }
    conv.guestCount = count;
    conv.step = 'flavor';
    await conversationStore.setOrder(telegramId, conv);
    await ctx.reply(
      `👥 ${count} guests — perfect!\n\n<b>4.</b> What flavor would you like?\n` +
        `(e.g., Madagascar Vanilla Bean, Rich Chocolate Ganache, Salted Caramel Pecan)`,
      { parse_mode: 'HTML' }
    );
  },

  flavor: async (ctx, conv, text, telegramId) => {
    conv.flavor = text;
    conv.step = 'tierCount';
    await conversationStore.setOrder(telegramId, conv);
    await ctx.reply(
      `🍰 <b>${text}</b> — delicious choice!\n\n<b>5.</b> How many tiers? (1-4)`,
      { parse_mode: 'HTML' }
    );
  },

  tierCount: async (ctx, conv, text, telegramId) => {
    const tiers = Number.parseInt(text, 10);
    if (Number.isNaN(tiers) || tiers < 1 || tiers > 4) {
      await ctx.reply('⚠️ Please enter a number between 1 and 4.');
      return;
    }
    conv.tierCount = tiers;
    conv.step = 'designStyle';
    await conversationStore.setOrder(telegramId, conv);
    await ctx.reply(
      `${tiers} tier${tiers > 1 ? 's' : ''} — noted!\n\n<b>6.</b> Any particular design style or theme?\n` +
        `(e.g., modern gold edges, floral, minimalist, character theme)`,
      { parse_mode: 'HTML' }
    );
  },

  designStyle: async (ctx, conv, text, telegramId) => {
    conv.designStyle = text;
    conv.step = 'contactPhone';
    await conversationStore.setOrder(telegramId, conv);
    await ctx.reply(
      `🎨 Nice.\n\n<b>7.</b> What phone number should we use to reach you?\n` +
        `(e.g., +251 911 123 456)`,
      { parse_mode: 'HTML' }
    );
  },

  contactPhone: async (ctx, conv, text, telegramId) => {
    conv.contactPhone = text;
    conv.step = 'specialInstructions';
    await conversationStore.setOrder(telegramId, conv);
    await ctx.reply(
      `📞 Got it!\n\n<b>8.</b> Any special instructions or dietary needs?\n` +
        `(Reply "none" if not)`,
      { parse_mode: 'HTML' }
    );
  },

  specialInstructions: async (ctx, conv, text, telegramId) => {
    conv.specialInstructions = text === 'none' ? '' : text;
    conv.step = 'done';

    const requestId = makeOrderId();
    const requestDate = formatRequestDate();

    const order = await ordersRepository.create(
      {
        id: requestId,
        userId: conv.userId,
        contactName: conv.contactName,
        contactPhone: conv.contactPhone,
        eventType: conv.eventType || 'Custom Order',
        guestCount: conv.guestCount || 1,
        eventDate: conv.eventDate || 'TBD',
        designStyle: conv.designStyle || 'Classic',
        flavor: conv.flavor || 'Vanilla',
        tierCount: conv.tierCount || 1,
        specialInstructions: conv.specialInstructions || '',
        requestDate,
      },
      { source: 'telegram_bot', userId: conv.userId }
    );

    await conversationStore.clearOrder(telegramId);

    notifyStaffNewOrder(order).catch((e) =>
      console.error('[Notify] Failed to notify staff of new order:', e.message)
    );

    await ctx.reply(
      `✅ <b>Your cake request has been sent!</b> 🎂\n\n` +
        `Here's your summary:\n` +
        `• <b>Event:</b> ${conv.eventType}\n` +
        `• <b>Date:</b> ${conv.eventDate}\n` +
        `• <b>Guests:</b> ${conv.guestCount}\n` +
        `• <b>Flavor:</b> ${conv.flavor}\n` +
        `• <b>Tiers:</b> ${conv.tierCount}\n` +
        `• <b>Order ID:</b> <code>${requestId}</code>\n\n` +
        `Yodit will review your request and get back to you soon! Use /status to check your order anytime.`,
      { parse_mode: 'HTML' }
    );
  },
};

export async function handleOrderWizardStep(
  ctx: Context,
  conv: OrderConversation,
  text: string,
  telegramId: string
): Promise<boolean> {
  const handler = stepHandlers[conv.step as OrderWizardStep];
  if (!handler) {
    return false;
  }
  await handler(ctx, conv, text, telegramId);
  return true;
}
