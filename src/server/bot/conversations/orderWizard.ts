import { Context } from 'grammy';
import { ordersService } from '../../modules/orders/orders.service';
import { getConversationStore } from '../../platform/integrations/redis/conversationState';
import { businessAvailabilityService } from '../../modules/business/businessAvailability.service';
import { escapeHtml, formatDate } from '../botHelpers';
import { env } from '../../platform/config/env';
import type { OrderConversation, OrderWizardStep } from '../types';

const conversationStore = getConversationStore();

export const WIZARD_STEPS: OrderWizardStep[] = [
  'eventType',
  'eventDate',
  'guestCount',
  'flavor',
  'tierCount',
  'designStyle',
  'contactPhone',
  'specialInstructions',
  'summary',
];

export function getEventTypeButtons() {
  return [
    [
      { text: '🎂 Birthday', callback_data: 'wiz_event:Birthday' },
      { text: '💍 Wedding', callback_data: 'wiz_event:Wedding' },
    ],
    [
      { text: '🥂 Anniversary', callback_data: 'wiz_event:Anniversary' },
      { text: '🎉 Celebration', callback_data: 'wiz_event:Celebration' },
    ],
    [
      { text: '👶 Baby Shower', callback_data: 'wiz_event:Baby Shower' },
      { text: '✨ Custom/Other', callback_data: 'wiz_event:Custom Order' },
    ],
    [{ text: '❌ Cancel Request', callback_data: 'wiz_cancel' }],
  ];
}

export function getNavButtons(includeBack = true) {
  const row = [];
  if (includeBack) {
    row.push({ text: '◀️ Back', callback_data: 'wiz_back' });
  }
  row.push({ text: '❌ Cancel', callback_data: 'wiz_cancel' });
  return [row];
}

export function getGuestCountButtons() {
  return [
    [
      { text: '10–15 guests', callback_data: 'wiz_guest:15' },
      { text: '20–25 guests', callback_data: 'wiz_guest:25' },
    ],
    [
      { text: '30–40 guests', callback_data: 'wiz_guest:35' },
      { text: '50+ guests', callback_data: 'wiz_guest:50' },
    ],
    [{ text: '◀️ Back', callback_data: 'wiz_back' }, { text: '❌ Cancel', callback_data: 'wiz_cancel' }],
  ];
}

export function getFlavorButtons() {
  return [
    [
      { text: '🍦 Madagascar Vanilla', callback_data: 'wiz_flavor:Madagascar Vanilla' },
      { text: '🍫 Chocolate Ganache', callback_data: 'wiz_flavor:Rich Chocolate Ganache' },
    ],
    [
      { text: '🍯 Salted Caramel', callback_data: 'wiz_flavor:Salted Caramel Pecan' },
      { text: '🍓 Red Velvet', callback_data: 'wiz_flavor:Red Velvet' },
    ],
    [
      { text: '🍋 Lemon Blueberry', callback_data: 'wiz_flavor:Lemon Blueberry' },
      { text: '☕ Mocha Espresso', callback_data: 'wiz_flavor:Mocha Espresso' },
    ],
    [{ text: '◀️ Back', callback_data: 'wiz_back' }, { text: '❌ Cancel', callback_data: 'wiz_cancel' }],
  ];
}

export function getTierCountButtons() {
  return [
    [
      { text: '1 Tier', callback_data: 'wiz_tier:1' },
      { text: '2 Tiers', callback_data: 'wiz_tier:2' },
    ],
    [
      { text: '3 Tiers', callback_data: 'wiz_tier:3' },
      { text: '4 Tiers', callback_data: 'wiz_tier:4' },
    ],
    [{ text: '◀️ Back', callback_data: 'wiz_back' }, { text: '❌ Cancel', callback_data: 'wiz_cancel' }],
  ];
}

export function getDesignStyleButtons() {
  return [
    [
      { text: '🌸 Floral & Botanicals', callback_data: 'wiz_design:Floral & Botanicals' },
      { text: '✨ Modern Gold Accents', callback_data: 'wiz_design:Modern Gold Accents' },
    ],
    [
      { text: '🎨 Character & Themed', callback_data: 'wiz_design:Character & Themed' },
      { text: '🍫 Textured Drip', callback_data: 'wiz_design:Textured Drip' },
    ],
    [{ text: '📸 Custom / Send Photo', callback_data: 'wiz_design:Custom Photo Design' }],
    [{ text: '◀️ Back', callback_data: 'wiz_back' }, { text: '❌ Cancel', callback_data: 'wiz_cancel' }],
  ];
}

export function getSpecialInstructionsButtons() {
  return [
    [{ text: '✅ No Special Notes', callback_data: 'wiz_notes:none' }],
    [
      { text: '🥜 Nut Allergy Alert', callback_data: 'wiz_notes:Nut Allergy' },
      { text: '🌾 Gluten Sensitive', callback_data: 'wiz_notes:Gluten Sensitive' },
    ],
    [{ text: '◀️ Back', callback_data: 'wiz_back' }, { text: '❌ Cancel', callback_data: 'wiz_cancel' }],
  ];
}

export function getSummaryButtons() {
  return [
    [{ text: '✅ Confirm & Send Request', callback_data: 'wiz_confirm' }],
    [
      { text: '✏️ Edit Details', callback_data: 'wiz_back' },
      { text: '❌ Cancel Request', callback_data: 'wiz_cancel' },
    ],
  ];
}

export async function renderStepPrompt(ctx: Context, conv: OrderConversation): Promise<void> {
  switch (conv.step) {
    case 'eventType':
      await ctx.reply(
        '<b>1.</b> What type of event is this celebration for?\nChoose a button below or type your event:',
        {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: getEventTypeButtons() },
        }
      );
      break;

    case 'eventDate':
      await ctx.reply(
        `Great, a <b>${escapeHtml(conv.eventType)}</b> cake! 🎉\n\n` +
          '<b>2.</b> What date do you need it by?\n(e.g., July 15, 2026 or 2026-07-15)',
        {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: getNavButtons(true) },
        }
      );
      break;

    case 'guestCount':
      await ctx.reply(
        `📅 <b>${escapeHtml(conv.eventDate)}</b> — noted!\n\n` +
          '<b>3.</b> How many guests will the cake serve?\nPick a range below or type an exact count:',
        {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: getGuestCountButtons() },
        }
      );
      break;

    case 'flavor':
      await ctx.reply(
        `👥 <b>${conv.guestCount} guests</b> — perfect!\n\n` +
          '<b>4.</b> What flavor would you like?\nChoose one of our favorites or type your own:',
        {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: getFlavorButtons() },
        }
      );
      break;

    case 'tierCount':
      await ctx.reply(
        `🍰 <b>${escapeHtml(conv.flavor)}</b> — delicious choice!\n\n` +
          '<b>5.</b> How many tiers would you like? (1–4)',
        {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: getTierCountButtons() },
        }
      );
      break;

    case 'designStyle':
      await ctx.reply(
        `🎂 <b>${conv.tierCount} tier${(conv.tierCount ?? 1) > 1 ? 's' : ''}</b> — noted!\n\n` +
          '<b>6.</b> Any particular design style or theme?\nChoose below, describe in text, or send a reference photo:',
        {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: getDesignStyleButtons() },
        }
      );
      break;

    case 'contactPhone':
      await ctx.reply(
        `🎨 <b>${escapeHtml(conv.designStyle)}</b> — beautiful!\n\n` +
          '<b>7.</b> What phone number should we use to reach you?\n' +
          'You can share your contact or type your phone number (e.g., +251 911 123 456):',
        {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [[{ text: '📱 Share Phone Number', request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        }
      );
      break;

    case 'specialInstructions':
      await ctx.reply(
        `📞 <b>${escapeHtml(conv.contactPhone)}</b> — got it!\n\n` +
          '<b>8.</b> Any special instructions, allergy notes, or dietary needs?',
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: getSpecialInstructionsButtons(),
          },
        }
      );
      break;

    case 'summary':
      await renderSummary(ctx, conv);
      break;

    default:
      break;
  }
}

export async function renderSummary(ctx: Context, conv: OrderConversation): Promise<void> {
  const formattedDate = conv.eventDate ? formatDate(conv.eventDate) : 'TBD';
  const notes = conv.specialInstructions && conv.specialInstructions.trim().length > 0
    ? escapeHtml(conv.specialInstructions)
    : 'None';

  const text =
    '📋 <b>Review Your Cake Request:</b>\n\n' +
    `• <b>Event:</b> ${escapeHtml(conv.eventType)}\n` +
    `• <b>Date Needed:</b> ${escapeHtml(formattedDate)}\n` +
    `• <b>Guests:</b> ${conv.guestCount}\n` +
    `• <b>Flavor:</b> ${escapeHtml(conv.flavor)}\n` +
    `• <b>Tiers:</b> ${conv.tierCount}\n` +
    `• <b>Design:</b> ${escapeHtml(conv.designStyle)}\n` +
    `• <b>Phone:</b> ${escapeHtml(conv.contactPhone)}\n` +
    `• <b>Notes:</b> ${notes}\n\n` +
    'Ready to send this request to Yodit for a custom price quote?';

  await ctx.reply(text, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: getSummaryButtons(),
    },
  });
}

export async function submitOrder(
  ctx: Context,
  conv: OrderConversation,
  telegramId: string
): Promise<void> {
  const order = await ordersService.create(
    {
      contactName: conv.contactName,
      contactPhone: conv.contactPhone,
      eventType: conv.eventType || 'Custom Order',
      guestCount: conv.guestCount || 1,
      eventDate: conv.eventDate || 'TBD',
      designStyle: conv.designStyle || 'Classic',
      flavor: conv.flavor || 'Vanilla',
      tierCount: conv.tierCount || 1,
      specialInstructions: conv.specialInstructions || '',
      referenceImage: conv.referenceImage || null,
    },
    conv.userId,
    'telegram_bot'
  );

  await conversationStore.clearOrder(telegramId);

  await ctx.reply(
    `✅ <b>Your cake request has been sent!</b> 🎂\n\n` +
      'Here is your request summary:\n' +
      `• <b>Order ID:</b> <code>${escapeHtml(order.id)}</code>\n` +
      `• <b>Event:</b> ${escapeHtml(conv.eventType)}\n` +
      `• <b>Date:</b> ${escapeHtml(conv.eventDate)}\n` +
      `• <b>Guests:</b> ${conv.guestCount}\n` +
      `• <b>Flavor:</b> ${escapeHtml(conv.flavor)}\n` +
      `• <b>Tiers:</b> ${conv.tierCount}\n\n` +
      'Yodit will review your design and quote a price shortly! Use /status to check your order anytime.',
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔍 View Order Status', callback_data: `view_order:${order.id}` }],
          [{ text: '🌐 Open Bakery Menu', url: env.FRONTEND_URL || 'https://flavour-bites.vercel.app' }],
        ],
      },
    }
  );
}

export async function stepBack(
  ctx: Context,
  conv: OrderConversation,
  telegramId: string
): Promise<void> {
  const currentIndex = WIZARD_STEPS.indexOf(conv.step as OrderWizardStep);
  if (currentIndex <= 0) {
    await ctx.reply('You are at the first question. Would you like to cancel?', {
      reply_markup: {
        inline_keyboard: [[{ text: '❌ Cancel Request', callback_data: 'wiz_cancel' }]],
      },
    });
    return;
  }

  conv.step = WIZARD_STEPS[currentIndex - 1];
  await conversationStore.setOrder(telegramId, conv);
  await renderStepPrompt(ctx, conv);
}

export async function cancelWizard(ctx: Context, telegramId: string): Promise<void> {
  await conversationStore.clearOrder(telegramId);
  await ctx.reply('❌ Cake request cancelled. Use /order anytime to start fresh!', {
    reply_markup: { remove_keyboard: true },
  });
}

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
    await renderStepPrompt(ctx, conv);
  },

  eventDate: async (ctx, conv, text, telegramId) => {
    const validation = await businessAvailabilityService.validateOrderDate(text);

    if (!validation.valid) {
      await ctx.reply(
        `⚠️ ${validation.error}\n\nPlease enter a valid date (e.g., July 15, 2026):`,
        {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: getNavButtons(true) },
        }
      );
      return;
    }

    const savedDate = validation.normalizedDate ?? text;
    conv.eventDate = savedDate;
    conv.step = 'guestCount';
    await conversationStore.setOrder(telegramId, conv);
    await renderStepPrompt(ctx, conv);
  },

  guestCount: async (ctx, conv, text, telegramId) => {
    const parsed = Number.parseInt(text.replace(/\D/g, ''), 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      await ctx.reply('⚠️ Please enter a valid number of guests (e.g. 25).', {
        reply_markup: { inline_keyboard: getGuestCountButtons() },
      });
      return;
    }
    conv.guestCount = parsed;
    conv.step = 'flavor';
    await conversationStore.setOrder(telegramId, conv);
    await renderStepPrompt(ctx, conv);
  },

  flavor: async (ctx, conv, text, telegramId) => {
    conv.flavor = text;
    conv.step = 'tierCount';
    await conversationStore.setOrder(telegramId, conv);
    await renderStepPrompt(ctx, conv);
  },

  tierCount: async (ctx, conv, text, telegramId) => {
    const parsed = Number.parseInt(text.replace(/\D/g, ''), 10);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 4) {
      await ctx.reply('⚠️ Please enter a number of tiers between 1 and 4.', {
        reply_markup: { inline_keyboard: getTierCountButtons() },
      });
      return;
    }
    conv.tierCount = parsed;
    conv.step = 'designStyle';
    await conversationStore.setOrder(telegramId, conv);
    await renderStepPrompt(ctx, conv);
  },

  designStyle: async (ctx, conv, text, telegramId) => {
    conv.designStyle = text;
    conv.step = 'contactPhone';
    await conversationStore.setOrder(telegramId, conv);
    await renderStepPrompt(ctx, conv);
  },

  contactPhone: async (ctx, conv, text, telegramId) => {
    const cleanPhone = text.trim();
    if (cleanPhone.replace(/\D/g, '').length < 7) {
      await ctx.reply('⚠️ Please provide a valid phone number with at least 7 digits:');
      return;
    }
    conv.contactPhone = cleanPhone;
    conv.step = 'specialInstructions';
    await conversationStore.setOrder(telegramId, conv);
    await renderStepPrompt(ctx, conv);
  },

  specialInstructions: async (ctx, conv, text, telegramId) => {
    conv.specialInstructions = text.toLowerCase() === 'none' ? '' : text;
    conv.step = 'summary';
    await conversationStore.setOrder(telegramId, conv);
    await renderSummary(ctx, conv);
  },

  summary: async (ctx, conv, text, telegramId) => {
    const lower = text.trim().toLowerCase();
    if (lower === 'confirm' || lower === 'yes' || lower === 'ok') {
      await submitOrder(ctx, conv, telegramId);
    } else if (lower === 'back' || lower === 'edit') {
      await stepBack(ctx, conv, telegramId);
    } else if (lower === 'cancel') {
      await cancelWizard(ctx, telegramId);
    } else {
      await ctx.reply('Please choose an option below to confirm or edit your request:', {
        reply_markup: { inline_keyboard: getSummaryButtons() },
      });
    }
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

export async function handleWizardCallback(
  ctx: Context,
  data: string,
  telegramId: string
): Promise<boolean> {
  const conv = await conversationStore.getOrder(telegramId);
  if (!conv) {
    await ctx.reply('No active order request found. Use /order to start a new request!', {
      reply_markup: { remove_keyboard: true },
    });
    return true;
  }

  if (data === 'wiz_cancel') {
    await cancelWizard(ctx, telegramId);
    return true;
  }

  if (data === 'wiz_back') {
    await stepBack(ctx, conv, telegramId);
    return true;
  }

  if (data === 'wiz_confirm') {
    await submitOrder(ctx, conv, telegramId);
    return true;
  }

  if (data.startsWith('wiz_event:')) {
    const event = data.slice('wiz_event:'.length);
    await stepHandlers.eventType(ctx, conv, event, telegramId);
    return true;
  }

  if (data.startsWith('wiz_guest:')) {
    const guests = data.slice('wiz_guest:'.length);
    await stepHandlers.guestCount(ctx, conv, guests, telegramId);
    return true;
  }

  if (data.startsWith('wiz_flavor:')) {
    const flavor = data.slice('wiz_flavor:'.length);
    await stepHandlers.flavor(ctx, conv, flavor, telegramId);
    return true;
  }

  if (data.startsWith('wiz_tier:')) {
    const tier = data.slice('wiz_tier:'.length);
    await stepHandlers.tierCount(ctx, conv, tier, telegramId);
    return true;
  }

  if (data.startsWith('wiz_design:')) {
    const design = data.slice('wiz_design:'.length);
    await stepHandlers.designStyle(ctx, conv, design, telegramId);
    return true;
  }

  if (data.startsWith('wiz_notes:')) {
    const note = data.slice('wiz_notes:'.length);
    await stepHandlers.specialInstructions(ctx, conv, note, telegramId);
    return true;
  }

  return false;
}
