import { Bot } from "grammy";
import type { InlineQueryResultArticle, InputTextMessageContent } from "grammy/types";
import { ordersService } from "../modules/orders/orders.service";
import { productsService } from "../modules/products/products.service";

export function handleInline(bot: Bot) {
    bot.on("inline_query", async (ctx) => {
        const query = ctx.inlineQuery.query.trim().toLowerCase();

        if (query.length === 0) {
            return ctx.answerInlineQuery([]);
        }

        const [orders, gallery] = await Promise.all([
            ordersService.search(query, 30),
            productsService.search(query, 10),
        ]);

        const results: InlineQueryResultArticle[] = [];

        for (const order of orders) {
            const statusEmoji: Record<string, string> = {
                Received: "📬", Designing: "✏️", Priced: "💰",
                Confirmed: "✅", InProgress: "🔥", Ready: "🎂", Completed: "✔️",
            };
            const emoji = statusEmoji[order.status] ?? "📦";

            results.push({
                type: "article",
                id: `order_${order.id}`,
                title: `${order.id} — ${order.contactName}`,
                description: `${emoji} ${order.eventType} · ${order.flavor} · ${order.eventDate}`,
                thumbnail_url: undefined,
                input_message_content: {
                    message_text:
                        `<b>🎂 Order #${order.id}</b>\n` +
                        `${emoji} <b>Status:</b> ${order.status}\n` +
                        `👤 <b>Customer:</b> ${order.contactName}\n` +
                        `📞 <b>Phone:</b> ${order.contactPhone}\n` +
                        `🎉 <b>Event:</b> ${order.eventType}\n` +
                        `🍰 <b>Flavor:</b> ${order.flavor}\n` +
                        `📅 <b>Date:</b> ${order.eventDate}\n` +
                        `👥 <b>Guests:</b> ${order.guestCount}\n` +
                        `🏗️ <b>Tiers:</b> ${order.tierCount}\n` +
                        (order.price
                            ? `💰 <b>Price:</b> ${order.price.toLocaleString()} ETB\n`
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
