import { sendMessage, type InlineKeyboard } from '@server/platform/integrations/telegram/telegramClient.js';
import { getPrisma } from '@server/platform/config/prisma.js';
import type { CustomCakeRequest, User } from '@prisma/client';
import { escapeHtml, formatDate } from '../../../bot/botHelpers';

import { STATUS_EMOJI, STATUS_LABEL } from '../../../../shared/constants/orderStatus';
import { BUSINESS_INFO } from '../../../../shared/constants/business';

const etb = (n: number) => `${n.toLocaleString()} ETB`;

export async function getStaffChatIds(): Promise<string[]> {
  try {
    const prisma = getPrisma();
    const staff = await prisma.user.findMany({
      where: {
        role: { in: ['admin', 'staff'] },
        notifyViaTelegram: true,
        telegramId: { not: '' },
        deletedAt: null,
      },
      select: { telegramId: true },
    });
    return staff.map((u) => u.telegramId);
  } catch {
    return [];
  }
}

function getOrderPrice(order: { price?: number | null; finalPrice?: number | null }) {
  return order.finalPrice ?? order.price ?? 0;
}

export async function notifyStaffNewOrder(
  order: CustomCakeRequest & { user?: Partial<User> | null },
): Promise<void> {
  const text = [
    `<b>🎂 New Cake Request! ${escapeHtml(order.id)}</b>`,
    '',
    `<b>Customer:</b> ${escapeHtml(order.contactName)}`,
    `<b>Phone:</b> ${escapeHtml(order.contactPhone)}`,
    order.user?.telegramUsername
      ? `<b>Telegram:</b> @${escapeHtml(order.user.telegramUsername)}`
      : '',
    '',
    `<b>Event:</b> ${escapeHtml(order.eventType)}`,
    `<b>Date needed:</b> ${escapeHtml(order.eventDate)}`,
    `<b>Guests:</b> ${order.guestCount} people`,
    `<b>Tiers:</b> ${order.tierCount}`,
    `<b>Flavour:</b> ${escapeHtml(order.flavor)}`,
    `<b>Style:</b> ${escapeHtml(order.designStyle)}`,
    '',
    `<b>Price:</b> ${etb(getOrderPrice(order))}`,
    '',
    order.specialInstructions
      ? `<b>Special instructions:</b>\n${escapeHtml(order.specialInstructions)}`
      : '<i>No special instructions</i>',
  ]
    .filter(Boolean)
    .join('\n');

  const buttons: InlineKeyboard = [
    [{ text: '✏️ Start Designing', callback_data: `status:${order.id}:Designing` }],
    [{ text: '💰 Send Price', callback_data: `price:${order.id}` }],
    [{ text: '❌ Cancel Order', callback_data: `cancel_prompt:${order.id}` }],
  ];

  const staffIds = await getStaffChatIds();
  await Promise.allSettled(staffIds.map((id) => sendMessage(id, text, buttons)));
}

export async function notifyCustomerStatusChange(orderId: string): Promise<void> {
  const prisma = getPrisma();

  const order = await prisma.customCakeRequest.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order) return;
  if (order.lastNotifiedStatus === order.status) return;
  if (!order.user?.telegramId) return;
  if (!order.user.notifyViaTelegram) return;

  const emoji = STATUS_EMOJI[order.status] ?? '📦';
  const label = STATUS_LABEL[order.status] ?? order.status;

  let message: string;
  let buttons: Array<Array<{ text: string; callback_data: string }>> | undefined;

  switch (order.status) {
    case 'Designing':
      message = `${emoji} <b>Your cake is being designed!</b>\n\nHi ${order.contactName}! Yodit has started working on the design for your <b>${order.eventType}</b> cake.\n\nWe'll send you the price once the design is ready. This usually takes 1-2 days.\n\n<b>Your order:</b> <code>${order.id}</code>`;
      break;

    case 'Priced': {
      const price = getOrderPrice(order);
      const deposit = Math.round((price || 0) * 0.5);
      message = [
        `${emoji} <b>Your price quote is ready!</b>`,
        '',
        `Hi ${escapeHtml(order.contactName)}! Yodit has quoted a price for your custom <b>${escapeHtml(order.eventType)}</b> cake:`,
        '',
        `💰 <b>Total Price:</b> ${etb(price)}`,
        `💵 <b>50% Deposit to Confirm:</b> ${etb(deposit)}`,
        order.bakerNote ? `\n📝 <i>Note from Yodit: ${escapeHtml(order.bakerNote)}</i>` : '',
        '',
        `Please accept the quote or request a revision below. Your date (${formatDate(order.eventDate)}) is held for 48 hours.`,
      ]
        .filter(Boolean)
        .join('\n');
      buttons = [
        [
          { text: `✅ Accept Price (${etb(price)})`, callback_data: `confirm:${order.id}` },
          { text: '💬 Request Revision', callback_data: `revise:${order.id}` },
        ],
      ];
      break;
    }

    case 'Confirmed':
      message = [
        `${emoji} <b>Order confirmed! You're all set.</b>`,
        '',
        `Wonderful! Your <b>${order.eventType}</b> cake is officially booked.`,
        '',
        `<b>Event date:</b> ${order.eventDate}`,
        '',
        "We'll keep you updated as your cake progresses. Feel free to message this bot anytime to check your order.",
      ].join('\n');
      break;

    case 'InProgress':
      message = [
        `${emoji} <b>Your cake is in the oven!</b>`,
        '',
        `Hi ${order.contactName}! Yodit has started baking your <b>${order.eventType}</b> cake. 🔥`,
        '',
        `<b>Expected ready date:</b> ${order.eventDate}`,
        '',
        "We'll notify you as soon as it's ready.",
      ].join('\n');
      break;

    case 'Ready':
      message = [
        `${emoji} <b>Your cake is READY! 🎉</b>`,
        '',
        `Your beautiful <b>${order.eventType}</b> cake is done and waiting for you!`,
        '',
        `🏠 You can pick it up from Yodit's ${BUSINESS_INFO.location.area} studio. Please bring your order number:\n<code>${order.id}</code>`,
        '',
        'Thank you for choosing Flavour Bites! 🎂',
      ].join('\n');
      break;

    case 'Completed':
      message = [
        `${emoji} <b>Order Completed! 🎉</b>`,
        '',
        `Hi ${escapeHtml(order.contactName)}! Your order <code>${escapeHtml(order.id)}</code> has been completed.`,
        '',
        'We hope you and your guests loved the cake! Thank you for choosing Flavour Bites.',
      ].join('\n');
      break;

    case 'Cancelled':
      message = [
        `${emoji} <b>Order Cancelled</b>`,
        '',
        `Your order <code>${escapeHtml(order.id)}</code> has been cancelled.`,
        '',
        "If this was unexpected or you'd like to discuss, please contact our studio team.",
      ].join('\n');
      break;

    default:
      message = `${emoji} Your order <code>${escapeHtml(order.id)}</code> status is now: <b>${escapeHtml(label)}</b>`;
  }

  const sent = await sendMessage(order.user.telegramId, message, buttons);

  if (sent) {
    await prisma.customCakeRequest.update({
      where: { id: orderId },
      data: { lastNotifiedStatus: order.status },
    });
  }
}

export async function notifyCustomerPriceUpdated(orderId: string): Promise<void> {
  await notifyCustomerStatusChange(orderId);
}

export async function notifyStaffRevisionRequested(
  order: CustomCakeRequest & { user?: Partial<User> | null },
  reason?: string | null,
): Promise<void> {
  const text = [
    `💬 <b>Price Revision Requested!</b>`,
    '',
    `<b>Customer:</b> ${escapeHtml(order.contactName)} requested a price or detail revision for order <code>${escapeHtml(order.id)}</code>.`,
    `<b>Current Quoted Price:</b> ${etb(getOrderPrice(order))}`,
    `<b>Event:</b> ${escapeHtml(order.eventType)} · ${escapeHtml(order.flavor)}`,
    reason ? `<b>Customer Note:</b> <i>${escapeHtml(reason)}</i>` : '',
    '',
    'Please review the request and submit an updated price.',
  ]
    .filter(Boolean)
    .join('\n');

  const buttons: InlineKeyboard = [
    [{ text: '💰 Send Revised Price', callback_data: `price:${order.id}` }],
    [{ text: '❌ Cancel Order', callback_data: `cancel_prompt:${order.id}` }],
  ];

  const staffIds = await getStaffChatIds();
  await Promise.allSettled(staffIds.map((id) => sendMessage(id, text, buttons)));
}

export async function notifyStaffPriceConfirmed(
  order: CustomCakeRequest & { user?: User | null },
): Promise<void> {
  const text = [
    `✅ <b>Price Confirmed!</b>`,
    '',
    `<b>${escapeHtml(order.contactName)}</b> accepted the price for their <b>${escapeHtml(order.eventType)}</b> cake.`,
    `<b>Price:</b> ${etb(getOrderPrice(order))}`,
    `<b>Date:</b> ${escapeHtml(order.eventDate)}`,
    `<b>Order ID:</b> <code>${escapeHtml(order.id)}</code>`,
    '',
    'You can now mark it as In Progress when baking begins.',
  ].join('\n');

  const buttons: InlineKeyboard = [
    [{ text: '🔥 Mark In Progress', callback_data: `status:${order.id}:InProgress` }],
    [{ text: '❌ Cancel Order', callback_data: `cancel_prompt:${order.id}` }],
  ];

  const staffIds = await getStaffChatIds();
  await Promise.allSettled(staffIds.map((id) => sendMessage(id, text, buttons)));
}