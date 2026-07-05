import { Bot } from "grammy";
import { getPrisma } from "../app/config/prisma.js";
import { answerCallback, editMessage, sendMessage } from "../integrations/telegram/telegramClient.js";
import {
    getStaffChatIds,
    notifyCustomerStatusChange,
    notifyStaffQuoteAccepted,
} from "../integrations/telegram/telegramNotifications.js";
import { getConversationStore } from "../integrations/redis/conversationState.js";
import { updateOrderCommercials, updateOrderStatus } from "../modules/orders/orders.operations.js";

const conversationStore = getConversationStore();

export function handleCallbacks(bot: Bot) {
    bot.on("callback_query:data", async (ctx) => {
        const data = ctx.callbackQuery.data;
        const callbackId = ctx.callbackQuery.id;
        const messageId = ctx.callbackQuery.message?.message_id;
        const chatId = ctx.callbackQuery.message?.chat.id;
        const prisma = getPrisma();

        if (data.startsWith("status:")) {
            const [, orderId, newStatus] = data.split(":");

            const order = await updateOrderStatus(
                prisma,
                orderId,
                newStatus as any,
                {
                    source: "telegram_bot",
                    userId: ctx.from?.id ? String(ctx.from.id) : null,
                },
            );

            await notifyCustomerStatusChange(orderId);

            await editMessage(
                chatId!,
                messageId!,
                `✅ <b>Status updated to "${newStatus}"</b> for order <code>${orderId}</code>\n\n` +
                    `Customer: ${order.contactName} | ${order.eventType} | ${order.deliveryDate}`,
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
        } else if (data.startsWith("quote:")) {
            const [, orderId] = data.split(":");

            await conversationStore.setQuote(String(ctx.from?.id), {
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

            const order = await prisma.customCakeRequest.findUnique({
                where: { id: orderId },
                include: { user: true },
            });

            if (!order || order.user?.telegramId !== telegramId) {
                await answerCallback(
                    callbackId,
                    "⚠️ You can only confirm your own orders.",
                );
                return;
            }

            await updateOrderStatus(prisma, orderId, "Confirmed", {
                source: "telegram_bot",
                userId: order.user?.id ?? null,
            });

            await notifyCustomerStatusChange(orderId);
            await notifyStaffQuoteAccepted({ ...order, user: order.user });

            await editMessage(
                chatId!,
                messageId!,
                `✅ <b>Quote accepted!</b>\n\nYour <b>${order.eventType}</b> cake is now confirmed. We'll start baking and keep you posted. Thank you! 🎂`,
            );

            await answerCallback(callbackId, "Order confirmed!");
        } else if (data.startsWith("revise:")) {
            const [, orderId] = data.split(":");

            const order = await prisma.customCakeRequest.findUnique({
                where: { id: orderId },
            });

            const staffIds = await getStaffChatIds();
            for (const id of staffIds) {
                await sendMessage(
                    id,
                    `💬 <b>Quote Revision Requested</b>\n\n` +
                        `<b>${order?.contactName}</b> would like to discuss the quote for order <code>${orderId}</code>.\n` +
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

    bot.on("message:text", async (ctx) => {
        const senderId = String(ctx.from?.id);
        const pendingQuote = await conversationStore.getQuote(senderId);
        const orderId = pendingQuote?.orderId;
        if (!orderId) return;

        const priceRaw = ctx.message.text.replace(/[^0-9]/g, "");
        const price = parseInt(priceRaw, 10);

        if (isNaN(price) || price < 500 || price > 100000) {
            await ctx.reply(
                "⚠️ Please enter a valid price in ETB (e.g. <code>4500</code>).",
                { parse_mode: "HTML" },
            );
            return;
        }

        const prisma = getPrisma();

        await updateOrderCommercials(prisma, orderId, { quotedPrice: price });
        await updateOrderStatus(prisma, orderId, "Quoted", {
            source: "telegram_bot",
            userId: String(ctx.from?.id),
        });

        await conversationStore.clearQuote(senderId);

        await notifyCustomerStatusChange(orderId);

        await ctx.reply(
            `✅ Price of <b>${price.toLocaleString()} ETB</b> sent to the customer for order <code>${orderId}</code>.\n\nThey'll receive a notification with Accept/Change buttons.`,
            { parse_mode: "HTML" },
        );
    });
}
