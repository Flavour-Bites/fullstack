import { Bot } from "grammy";
import type { InlineQueryResultArticle, InputTextMessageContent } from "grammy/types";
import { getPrisma } from "../app/config/prisma.js";

export function handleInline(bot: Bot) {
    bot.on("inline_query", async (ctx) => {
        const query = ctx.inlineQuery.query.trim().toLowerCase();
        const prisma = getPrisma();

        if (query.length === 0) {
            return ctx.answerInlineQuery([]);
        }

        const [orders, gallery] = await Promise.all([
            prisma.customCakeRequest.findMany({
                where: {
                    deletedAt: null,
                    OR: [
                        { id: { contains: query, mode: "insensitive" } },
                        { contactName: { contains: query, mode: "insensitive" } },
                        { flavor: { contains: query, mode: "insensitive" } },
                        { eventType: { contains: query, mode: "insensitive" } },
                        { contactPhone: { contains: query, mode: "insensitive" } },
                    ],
                },
                orderBy: { createdAt: "desc" },
                take: 30,
            }),
            prisma.cakeGalleryItem.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: "insensitive" } },
                        { flavors: { has: query } },
                        { tags: { has: query } },
                        { description: { contains: query, mode: "insensitive" } },
                    ],
                },
                take: 10,
                orderBy: { createdAt: "desc" },
            }),
        ]);

        const results: InlineQueryResultArticle[] = [];

        for (const order of orders) {
            const statusEmoji: Record<string, string> = {
                Received: "📬", Designing: "✏️", Quoted: "💰",
                Confirmed: "✅", InProgress: "🔥", Ready: "🎂", Completed: "✔️",
            };
            const emoji = statusEmoji[order.status] ?? "📦";

            results.push({
                type: "article",
                id: `order_${order.id}`,
                title: `${order.id} — ${order.contactName}`,
                description: `${emoji} ${order.eventType} · ${order.flavor} · ${order.deliveryDate}`,
                thumbnail_url: undefined,
                input_message_content: {
                    message_text:
                        `<b>🎂 Order #${order.id}</b>\n` +
                        `${emoji} <b>Status:</b> ${order.status}\n` +
                        `👤 <b>Customer:</b> ${order.contactName}\n` +
                        `📞 <b>Phone:</b> ${order.contactPhone}\n` +
                        `🎉 <b>Event:</b> ${order.eventType}\n` +
                        `🍰 <b>Flavor:</b> ${order.flavor}\n` +
                        `📅 <b>Delivery:</b> ${order.deliveryDate}\n` +
                        `👥 <b>Guests:</b> ${order.guestCount}\n` +
                        `🏗️ <b>Tiers:</b> ${order.tierCount}\n` +
                        (order.quotedPrice
                            ? `💰 <b>Price:</b> ${order.quotedPrice.toLocaleString()} ETB\n`
                            : ""),
                    parse_mode: "HTML",
                } as InputTextMessageContent,
            });
        }

        for (const item of gallery) {
            results.push({
                type: "article",
                id: `gallery_${item.id}`,
                title: item.name,
                description: `${item.flavors.join(", ")} · ${item.servingCount} servings · ${item.priceEstimate}`,
                thumbnail_url: item.image || undefined,
                input_message_content: {
                    message_text:
                        `<b>🍰 ${item.name}</b>\n\n` +
                        `${item.description}\n\n` +
                        `<b>Flavors:</b> ${item.flavors.join(", ")}\n` +
                        `<b>Servings:</b> ${item.servingCount}\n` +
                        `<b>Price:</b> ${item.priceEstimate}`,
                    parse_mode: "HTML",
                } as InputTextMessageContent,
            });
        }

        await ctx.answerInlineQuery(results, {
            cache_time: 30,
            is_personal: true,
        });
    });
}
