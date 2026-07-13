import { sendMessage } from './telegramClient.js';
import { getPrisma } from '../../app/config/prisma.js';
import type { CustomCakeRequest, User } from '@prisma/client';

const STATUS_EMOJI: Record<string, string> = {
  Received: '📬',
  Designing: '✏️',
  Quoted: '💰',
  Confirmed: '✅',
  InProgress: '🔥',
  Ready: '🎂',
  Completed: '🌟',
  Cancelled: '❌',
};

const STATUS_LABEL: Record<string, string> = {
  Received: 'Request Received',
  Designing: 'Being Designed',
  Quoted: 'Quote Ready for Review',
  Confirmed: 'Order Confirmed',
  InProgress: 'Being Baked',
  Ready: 'Ready for Pickup / Delivery',
  Completed: 'Order Completed',
  Cancelled: 'Cancelled',
};

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

function getOrderPrice(order: { quotedPrice?: number | null; finalPrice?: number | null }) {
  return order.finalPrice ?? order.quotedPrice ?? 0;
}

export async function notifyStaffNewOrder(
  order: CustomCakeRequest & { user?: User | null },
): Promise<void> {
  const emoji = order.deliveryOption === 'delivery' ? '🚗' : '🏠';

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
    `<b>Date needed:</b> ${order.deliveryDate}`,
    `<b>Guests:</b> ${order.guestCount} people`,
    `<b>Tiers:</b> ${order.tierCount}`,
    `<b>Flavour:</b> ${order.flavor}`,
    `<b>Style:</b> ${order.designStyle}`,
    '',
    `${emoji} <b>${order.deliveryOption === 'delivery' ? 'Delivery to:' : 'Pickup'}</b>${order.deliveryAddress ? ` ${order.deliveryAddress}` : ''}`,
    `<b>Price:</b> ${etb(getOrderPrice(order))}`,
    '',
    order.specialInstructions
      ? `<b>Special instructions:</b>\n${order.specialInstructions}`
      : '<i>No special instructions</i>',
  ]
    .filter((line) => line)
    .join('\n');

  const buttons = [
    [{ text: '✏️ Start Designing', callback_data: `status:${order.id}:Designing` }],
    [{ text: '💰 Send Quote', callback_data: `quote:${order.id}` }],
    [{ text: '❌ Cancel Order', callback_data: `status:${order.id}:Cancelled` }],
  ];

  const staffIds = await getStaffChatIds();
  for (const id of staffIds) {
    await sendMessage(id, text, buttons);
  }
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
      message = `${emoji} <b>Your cake is being designed!</b>\n\nHi ${order.contactName}! Yodit has started working on the design for your <b>${order.eventType}</b> cake.\n\nWe'll send you the quote once the design is ready. This usually takes 1–2 days.\n\n<b>Your order:</b> <code>${order.id}</code>`;
      break;

    case 'Quoted':
      message = [
        `${emoji} <b>Your quote is ready!</b>`,
        '',
        `Hi ${order.contactName}! Your custom <b>${order.eventType}</b> cake quote is ready:`,
        '',
        `<b>Price: ${etb(getOrderPrice(order))}</b>`,
        order.bakerNote ? `\n<i>Note from Yodit: ${order.bakerNote}</i>` : '',
        '',
        `Please confirm or request a revision below. Your date (${order.deliveryDate}) is held for 48 hours.`,
      ].join('\n');
      buttons = [
        [
          { text: '✅ Accept Quote', callback_data: `confirm:${order.id}` },
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
        `<b>Delivery date:</b> ${order.deliveryDate}`,
        `<b>Option:</b> ${order.deliveryOption}`,
        order.deliveryAddress ? `<b>Address:</b> ${order.deliveryAddress}` : '',
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
        `<b>Expected ready date:</b> ${order.deliveryDate}`,
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
        order.deliveryOption === 'delivery'
          ? `🚗 Our delivery team will contact you shortly to arrange delivery to:\n<b>${order.deliveryAddress}</b>`
          : `🏠 You can pick it up from Yodit's Bole studio. Please bring your order number:\n<code>${order.id}</code>`,
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

export async function notifyStaffQuoteAccepted(
  order: CustomCakeRequest & { user?: User | null },
): Promise<void> {
  const text = [
    `✅ <b>Quote Accepted!</b>`,
    '',
    `<b>${order.contactName}</b> accepted the quote for their <b>${order.eventType}</b> cake.`,
    `<b>Price:</b> ${etb(getOrderPrice(order))}`,
    `<b>Date:</b> ${order.deliveryDate}`,
    `<b>Order ID:</b> <code>${order.id}</code>`,
    '',
    'You can now mark it as In Progress when baking begins.',
  ].join('\n');

  const buttons = [
    [{ text: '🔥 Mark In Progress', callback_data: `status:${order.id}:InProgress` }],
  ];

  const staffIds = await getStaffChatIds();
  for (const id of staffIds) {
    await sendMessage(id, text, buttons);
  }
}
