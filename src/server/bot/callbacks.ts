import { Bot } from "grammy";
import { answerCallback, editMessage, sendMessage } from "../platform/integrations/telegram/telegramClient";
import { getStaffChatIds } from "../platform/integrations/telegram/telegramNotifications";
import { getConversationStore } from "../platform/integrations/redis/conversationState";
import { ordersService } from "../modules/orders/orders.service";
import { usersService } from "../modules/users/users.service";
import type { OrderStatus } from "@prisma/client";

const conversationStore = getConversationStore();

export function handleCallbacks(bot: Bot) {
    bot.on("callback_query:data", async (ctx) => {
        const data = ctx.callbackQuery.data;
        const callbackId = ctx.callbackQuery.id;
        const messageId = ctx.callbackQuery.message?.message_id;
        const chatId = ctx.callbackQuery.message?.chat.id;

        if (data.startsWith("status:")) {
            const [, orderId, newStatus] = data.split(":");

            try {
                const order = await ordersService.update(
                    orderId,
                    { status: newStatus as OrderStatus },
                    {
                        source: "telegram_bot",
                        userId: ctx.from?.id ? String(ctx.from.id) : null,
                    },
                );

                await editMessage(
                    chatId!,
                    messageId!,
                    `✅ <b>Status updated to "${newStatus}"</b> for order <code>${orderId}</code>\n\n` +
                        `Customer: ${order.contactName} | ${order.eventType} | ${order.eventDate}`,
                    newStatus === "InProgress"
                        ? [
                              [
                                  {
                                      text: "🎂 Mark Ready",
                                      callback_data: `status:${orderId}:Ready`,
                                  },
                              ],
                          ]
                        : undefined,
                );

                await answerCallback(callbackId, `Status updated to ${newStatus}`);
            } catch (err: any) {
                await answerCallback(callbackId, `⚠️ ${err.message || 'Failed to update status'}`);
            }
        } else if (data.startsWith("price:")) {
            const [, orderId] = data.split(":");

            await conversationStore.setPrice(String(ctx.from?.id), {
                orderId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            await answerCallback(callbackId);
            await ctx.reply(
                `💰 <b>Send price for order <code>${orderId}</code></b>\n\nReply with the price in ETB (numbers only).\nExample: <code>4500</code>`,
                { parse_mode: "HTML" },
            );
        } else if (data.startsWith("confirm:")) {
            const [, orderId] = data.split(":");
            const telegramId = String(ctx.from?.id);

            const user = await usersService.findByTelegramId(telegramId);
            if (!user) {
                await answerCallback(
                    callbackId,
                    "⚠️ Your account is not linked.",
                );
                return;
            }

            try {
                const updated = await ordersService.acceptPrice(
                    orderId,
                    user.id,
                    'customer',
                    'telegram_bot'
                );

                await editMessage(
                    chatId!,
                    messageId!,
                    `✅ <b>Price confirmed!</b>\n\nYour <b>${updated.eventType}</b> cake is now confirmed. We'll start baking and keep you posted. Thank you! 🎂`,
                );

                await answerCallback(callbackId, "Order confirmed!");
            } catch (err: any) {
                await answerCallback(
                    callbackId,
                    `⚠️ ${err.message || 'Cannot confirm order.'}`,
                );
            }
        } else if (data.startsWith("revise:")) {
            const [, orderId] = data.split(":");

            const order = await ordersService.findById(orderId);

            const staffIds = await getStaffChatIds();
            for (const id of staffIds) {
                await sendMessage(
                    id,
                    `💬 <b>Price Change Requested</b>\n\n` +
                        `<b>${order?.contactName}</b> would like to discuss the price for order <code>${orderId}</code>.\n` +
                        `Please contact them directly.`,
                );
            }

            await editMessage(
                chatId!,
                messageId!,
                `💬 <b>Change requested.</b>\n\nYodit will be in touch shortly to talk about the price for order <code>${orderId}</code>.`,
            );

            await answerCallback(
                callbackId,
                "Revision request sent to the baker.",
            );
        }
    });
}
