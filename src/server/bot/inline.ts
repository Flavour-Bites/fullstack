import { Bot } from "grammy";
import type { InlineQueryResultArticle, InputTextMessageContent } from "grammy/types";
import { ordersService } from "../modules/orders/orders.service";
import { productsService } from "../modules/products/products.service";
import { resolveTelegramUser, isStaffUser, escapeHtml, formatDate, formatCurrency } from "./botHelpers";
import { STATUS_EMOJI } from "../../shared/constants/orderStatus";

export function handleInline(bot: Bot) {
    bot.on("inline_query", async (ctx) => {
        const query = ctx.inlineQuery.query.trim().toLowerCase();

        if (query.length === 0) {
            return ctx.answerInlineQuery([]);
        }

        // Privacy: only staff/admin can query orders. Public users only get catalog results.
        const user = await resolveTelegramUser(ctx);
        const isStaff = isStaffUser(user);

        const [orders, gallery] = await Promise.all([
            isStaff && user ? ordersService.searchForStaff(query, { id: user.id, role: user.role }, 30) : Promise.resolve([]),
            productsService.search(query, 10),
        ]);

        const results: InlineQueryResultArticle[] = [];

        if (isStaff) {
            for (const order of orders) {
                const emoji = STATUS_EMOJI[order.status] ?? "📦";
                const eventDateFormatted = formatDate(order.eventDate);

                results.push({
                    type: "article",
                    id: `order_${order.id}`,
                    title: `${escapeHtml(order.id)} — ${escapeHtml(order.contactName)}`,
                    description: `${emoji} ${escapeHtml(order.eventType)} · ${escapeHtml(order.flavor)} · ${escapeHtml(eventDateFormatted)}`,
                    thumbnail_url: undefined,
                    input_message_content: {
                        message_text:
                            `<b>🎂 Order #${escapeHtml(order.id)}</b>\n` +
                            `${emoji} <b>Status:</b> ${escapeHtml(order.status)}\n` +
                            `👤 <b>Customer:</b> ${escapeHtml(order.contactName)}\n` +
                            `📞 <b>Phone:</b> ${escapeHtml(order.contactPhone)}\n` +
                            `🎉 <b>Event:</b> ${escapeHtml(order.eventType)}\n` +
                            `🍰 <b>Flavor:</b> ${escapeHtml(order.flavor)}\n` +
                            `📅 <b>Date:</b> ${escapeHtml(eventDateFormatted)}\n` +
                            `👥 <b>Guests:</b> ${order.guestCount}\n` +
                            `🏗️ <b>Tiers:</b> ${order.tierCount}\n` +
                            (order.price
                                ? `💰 <b>Price:</b> ${formatCurrency(order.price)}\n`
                                : ""),
                        parse_mode: "HTML",
                    } as InputTextMessageContent,
                });
            }
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
                        `<b>🍰 ${escapeHtml(item.name)}</b>\n\n` +
                        `${escapeHtml(item.description)}\n\n` +
                        `<b>Flavors:</b> ${escapeHtml(item.flavors.join(", "))}\n` +
                        `<b>Servings:</b> ${item.servingCount}\n` +
                        `<b>Price:</b> ${escapeHtml(item.priceEstimate)}`,
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
