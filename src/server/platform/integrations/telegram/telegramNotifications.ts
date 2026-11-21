import { sendMessage } from '@server/platform/integrations/telegram/telegramClient.js';
import { getPrisma } from '@server/platform/config/prisma.js';
import type { CustomCakeRequest, User } from '@prisma/client';

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
  order: CustomCakeRequest & { user?: User | null },
): Promise<void> {
  const text = [
    `<b>🎂 New Cake Request! ${order.id}</b>`,
    '',
    `<b>Customer:</b> ${order.contactName}`,
    `<b>Phone:</b> ${order.contactPhone}`,
    order.user?.telegramUsername
      ? `<b>Telegram:</b> @${order.user.telegramUsername}`
      : '',
    '',
    `<b>Event:</b> ${order.eventType}`,
    `<b>Date needed:</b> ${order.eventDate}`,
    `<b>Guests:</b> ${order.guestCount} people`,
    `<b>Tiers:</b> ${order.tierCount}`,
    `<b>Flavour:</b> ${order.flavor}`,
    `<b>Style:</b> ${order.designStyle}`,
    '',
    `<b>Price:</b> ${etb(getOrderPrice(order))}`,
    '',
    order.specialInstructions
      ? `<b>Special instructions:</b>\n${order.specialInstructions}`
      : '<i>No special instructions</i>',
  ]
    .filter(Boolean)
    .join('\n');

  const buttons = [
    [{ text: '✏️ Start Designing', callback_data: `status:${order.id}:Designing` }],
    [{ text: '💰 Send Price', callback_data: `price:${order.id}` }],
    [{ text: '❌ Cancel Order', callback_data: `status:${order.id}:Cancelled` }],
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

    case 'Priced':
      message = [
        `${emoji} <b>Your price is ready!</b>`,
        '',
        `Hi ${order.contactName}! Your custom <b>${order.eventType}</b> cake price is ready:`,
        '',
        `<b>Price: ${etb(getOrderPrice(order))}</b>`,
        order.bakerNote ? `\n<i>Note from Yodit: ${order.bakerNote}</i>` : '',
        '',
        `Please confirm or request a revision below. Your date (${order.eventDate}) is held for 48 hours.`,
      ].join('\n');
      buttons = [
        [
          { text: '✅ Accept Price', callback_data: `confirm:${order.id}` },
          { text: '💬 Request Revision', callback_data: `revise:${order.id}` },
        ],
      ];
      break;

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

    case 'Cancelled':
      message = [
        `${emoji} <b>Order Cancelled</b>`,
        '',
        `Your order <code>${order.id}</code> has been cancelled.`,
        '',
        "If this was unexpected or you'd like to discuss, please contact us directly.",
      ].join('\n');
      break;

    default:
      message = `${emoji} Your order <code>${order.id}</code> status is now: <b>${label}</b>`;
  }

  await sendMessage(order.user.telegramId, message, buttons);

  await prisma.customCakeRequest.update({
    where: { id: orderId },
    data: { lastNotifiedStatus: order.status },
  });
}

export async function notifyStaffPriceConfirmed(
  order: CustomCakeRequest & { user?: User | null },
): Promise<void> {
  const text = [
    `✅ <b>Price Confirmed!</b>`,
    '',
    `<b>${order.contactName}</b> accepted the price for their <b>${order.eventType}</b> cake.`,
    `<b>Price:</b> ${etb(getOrderPrice(order))}`,
    `<b>Date:</b> ${order.eventDate}`,
    `<b>Order ID:</b> <code>${order.id}</code>`,
    '',
    'You can now mark it as In Progress when baking begins.',
  ].join('\n');

  const buttons = [
    [{ text: '🔥 Mark In Progress', callback_data: `status:${order.id}:InProgress` }],
  ];

  const staffIds = await getStaffChatIds();
  await Promise.allSettled(staffIds.map((id) => sendMessage(id, text, buttons)));
}