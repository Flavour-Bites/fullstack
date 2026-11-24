import { Bot } from "grammy";
import { answerCallback, editMessage, type InlineKeyboard } from "../platform/integrations/telegram/telegramClient";
import { notifyStaffRevisionRequested } from "../platform/integrations/telegram/telegramNotifications";
import { getConversationStore } from "../platform/integrations/redis/conversationState";
import { ordersService } from "../modules/orders/orders.service";
import { resolveTelegramUser, isStaffUser, escapeHtml, formatDate } from "./botHelpers";
import type { OrderStatus } from "@prisma/client";

const conversationStore = getConversationStore();

export function getStaffActionButtons(orderId: string, status: OrderStatus): InlineKeyboard | undefined {
  switch (status) {
    case 'Received':
      return [
        [{ text: '✏️ Start Designing', callback_data: `status:${orderId}:Designing` }],
        [{ text: '💰 Send Price', callback_data: `price:${orderId}` }],
        [{ text: '❌ Cancel Order', callback_data: `cancel_prompt:${orderId}` }],
      ];
    case 'Designing':
      return [
        [{ text: '💰 Send Price', callback_data: `price:${orderId}` }],
        [{ text: '❌ Cancel Order', callback_data: `cancel_prompt:${orderId}` }],
      ];
    case 'Priced':
      return [
        [{ text: '💰 Update Price', callback_data: `price:${orderId}` }],
        [{ text: '❌ Cancel Order', callback_data: `cancel_prompt:${orderId}` }],
      ];
    case 'Confirmed':
      return [
        [{ text: '🔥 Mark In Progress', callback_data: `status:${orderId}:InProgress` }],
        [{ text: '❌ Cancel Order', callback_data: `cancel_prompt:${orderId}` }],
      ];
    case 'InProgress':
      return [
        [{ text: '🎂 Mark Ready', callback_data: `status:${orderId}:Ready` }],
        [{ text: '❌ Cancel Order', callback_data: `cancel_prompt:${orderId}` }],
      ];
    case 'Ready':
      return [
        [{ text: '✔️ Mark Completed', callback_data: `status:${orderId}:Completed` }],
        [{ text: '❌ Cancel Order', callback_data: `cancel_prompt:${orderId}` }],
      ];
    default:
      return undefined;
  }
}

export function handleCallbacks(bot: Bot) {
  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    const callbackId = ctx.callbackQuery.id;
    const messageId = ctx.callbackQuery.message?.message_id;
    const chatId = ctx.callbackQuery.message?.chat.id;

    if (!chatId || !messageId) {
      await answerCallback(callbackId, '⚠️ Invalid interaction.');
      return;
    }

    // 1. Staff Status Transition
    if (data.startsWith("status:")) {
      const [, orderId, newStatus] = data.split(":");

      const user = await resolveTelegramUser(ctx);
      if (!isStaffUser(user)) {
        await answerCallback(callbackId, '⚠️ Only bakery staff or admin can update order status.');
        return;
      }

      try {
        const order = await ordersService.update(
          orderId,
          { status: newStatus as OrderStatus },
          {
            source: "telegram_bot",
            userId: user!.id,
          },
        );

        await editMessage(
          chatId,
          messageId,
          `✅ <b>Status updated to "${escapeHtml(newStatus)}"</b> for order <code>${escapeHtml(orderId)}</code>\n\n` +
            `Customer: ${escapeHtml(order.contactName)} | ${escapeHtml(order.eventType)} | ${formatDate(order.eventDate)}`,
          getStaffActionButtons(orderId, newStatus as OrderStatus),
        );

        await answerCallback(callbackId, `Status updated to ${newStatus}`);
      } catch (err: any) {
        await answerCallback(callbackId, `⚠️ ${err.message || 'Failed to update status'}`);
      }
    }

    // 2. Staff Initiate Price Entry
    else if (data.startsWith("price:")) {
      const [, orderId] = data.split(":");

      const user = await resolveTelegramUser(ctx);
      if (!isStaffUser(user)) {
        await answerCallback(callbackId, '⚠️ Only bakery staff or admin can set prices.');
        return;
      }

      await conversationStore.setPrice(String(ctx.from?.id), {
        orderId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await answerCallback(callbackId);
      await ctx.reply(
        `💰 <b>Set price for order <code>${escapeHtml(orderId)}</code></b>\n\n` +
          `Reply with the price in ETB (numbers only).\nExample: <code>4500</code>\n\n` +
          `Send <code>/cancel</code> to abort.`,
        { parse_mode: "HTML" },
      );
    }

    // 3. Cancel Confirmation Prompt (Staff)
    else if (data.startsWith("cancel_prompt:")) {
      const [, orderId] = data.split(":");

      const user = await resolveTelegramUser(ctx);
      if (!isStaffUser(user)) {
        await answerCallback(callbackId, '⚠️ Staff or admin access required.');
        return;
      }

      const order = await ordersService.findById(orderId);
      if (!order) {
        await answerCallback(callbackId, '⚠️ Order not found.');
        return;
      }

      await editMessage(
        chatId,
        messageId,
        `⚠️ <b>Are you sure you want to cancel order <code>${escapeHtml(orderId)}</code>?</b>\n\n` +
          `Customer: ${escapeHtml(order.contactName)}\n` +
          `Current Status: ${escapeHtml(order.status)}\n\n` +
          `This will notify the customer that the order has been cancelled.`,
        [
          [
            { text: '⚠️ Confirm Cancellation', callback_data: `cancel_confirm:${orderId}` },
            { text: '↩️ Keep Order', callback_data: `cancel_abort:${orderId}` },
          ],
        ],
      );
      await answerCallback(callbackId);
    }

    // 4. Cancel Confirm (Staff)
    else if (data.startsWith("cancel_confirm:")) {
      const [, orderId] = data.split(":");

      const user = await resolveTelegramUser(ctx);
      if (!isStaffUser(user)) {
        await answerCallback(callbackId, '⚠️ Staff or admin access required.');
        return;
      }

      try {
        const order = await ordersService.update(
          orderId,
          { status: 'Cancelled' },
          {
            source: 'telegram_bot',
            userId: user!.id,
            note: 'Order cancelled by staff via Telegram.',
          },
        );

        await editMessage(
          chatId,
          messageId,
          `❌ <b>Order <code>${escapeHtml(orderId)}</code> has been cancelled.</b>\n\n` +
            `Customer: ${escapeHtml(order.contactName)} has been notified.`,
          undefined,
        );
        await answerCallback(callbackId, 'Order cancelled.');
      } catch (err: any) {
        await answerCallback(callbackId, `⚠️ ${err.message || 'Failed to cancel order.'}`);
      }
    }

    // 5. Cancel Abort (Staff)
    else if (data.startsWith("cancel_abort:")) {
      const [, orderId] = data.split(":");

      const user = await resolveTelegramUser(ctx);
      if (!isStaffUser(user)) {
        await answerCallback(callbackId, '⚠️ Staff access required.');
        return;
      }

      const order = await ordersService.findById(orderId);
      if (!order) {
        await answerCallback(callbackId, '⚠️ Order not found.');
        return;
      }

      await editMessage(
        chatId,
        messageId,
        `✅ <b>Order <code>${escapeHtml(orderId)}</code> kept.</b>\n\n` +
          `Status: <b>${escapeHtml(order.status)}</b> | Customer: ${escapeHtml(order.contactName)}`,
        getStaffActionButtons(orderId, order.status as OrderStatus),
      );
      await answerCallback(callbackId, 'Cancellation aborted.');
    }

    // 6. Customer Confirm Quoted Price
    else if (data.startsWith("confirm:")) {
      const [, orderId] = data.split(":");

      const user = await resolveTelegramUser(ctx);
      if (!user) {
        await answerCallback(callbackId, "⚠️ Your account is not linked. Please start the bot first.");
        return;
      }

      try {
        const updated = await ordersService.acceptPrice(
          orderId,
          user.id,
          user.role,
          'telegram_bot'
        );

        await editMessage(
          chatId,
          messageId,
          `✅ <b>Price confirmed!</b>\n\nYour <b>${escapeHtml(updated.eventType)}</b> cake is now confirmed. We will begin baking for your pickup date! Thank you! 🎂`,
          undefined,
        );

        await answerCallback(callbackId, "Order confirmed!");
      } catch (err: any) {
        await answerCallback(callbackId, `⚠️ ${err.message || 'Cannot confirm order.'}`);
      }
    }

    // 7. Customer Request Price Revision
    else if (data.startsWith("revise:")) {
      const [, orderId] = data.split(":");

      const user = await resolveTelegramUser(ctx);
      if (!user) {
        await answerCallback(callbackId, "⚠️ Your account is not linked.");
        return;
      }

      const order = await ordersService.findById(orderId);
      if (!order) {
        await answerCallback(callbackId, '⚠️ Order not found.');
        return;
      }

      // Check ownership or staff privileges
      if (user.role === 'customer' && order.userId !== user.id) {
        await answerCallback(callbackId, '⚠️ You can only request revisions for your own orders.');
        return;
      }

      await notifyStaffRevisionRequested(order);

      await editMessage(
        chatId,
        messageId,
        `💬 <b>Revision requested.</b>\n\nYodit has been notified and will review your request for order <code>${escapeHtml(orderId)}</code>.`,
        undefined,
      );

      await answerCallback(callbackId, "Revision request sent to Yodit.");
    }
  });
}
