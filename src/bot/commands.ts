import { Bot } from "grammy";
import { getPrisma } from "../app/config/prisma.js";
import { createOrder } from "../modules/orders/orders.operations.js";
import { notifyStaffNewOrder } from "../integrations/telegram/telegramNotifications.js";
import { getConversationStore } from "../integrations/redis/conversationState.js";

interface OrderConversation {
    step: string;
    userId: string;
    contactName: string;
    contactPhone: string;
    eventType?: string;
    deliveryDate?: string;
    guestCount?: number;
    flavor?: string;
    designStyle?: string;
    tierCount?: number;
    deliveryOption?: string;
    deliveryAddress?: string;
    specialInstructions?: string;
    createdAt: string;
    updatedAt: string;
}

const conversationStore = getConversationStore();

export function handleCommands(bot: Bot) {
    bot.command("start", async (ctx) => {
        const telegramId = String(ctx.from?.id);
        const prisma = getPrisma();
        const payload = ctx.match?.toString().trim();

        // ── Deep linking: order_<orderId> ──────────────────────────────────
        if (payload?.startsWith("order_")) {
            const orderId = payload.slice(6);
            const order = await prisma.customCakeRequest.findUnique({
                where: { id: orderId },
                include: { user: true },
            });

            if (!order) {
                return ctx.reply(
                    `⚠️ Order <code>${orderId}</code> not found.\n\nUse /start to see the welcome message.`,
                    { parse_mode: "HTML" },
                );
            }

            const statusEmoji: Record<string, string> = {
                Received: "📬", Designing: "✏️", Quoted: "💰",
                Confirmed: "✅", InProgress: "🔥", Ready: "🎂", Completed: "✔️",
            };
            const emoji = statusEmoji[order.status] ?? "📦";

            let msg =
                `<b>🎂 Order #${order.id}</b>\n\n` +
                `${emoji} <b>Status:</b> ${order.status}\n` +
                `👤 <b>Customer:</b> ${order.contactName}\n` +
                `📞 <b>Phone:</b> ${order.contactPhone}\n` +
                `🎉 <b>Event:</b> ${order.eventType}\n` +
                `🍰 <b>Flavor:</b> ${order.flavor}\n` +
                `📅 <b>Delivery:</b> ${order.deliveryDate}\n` +
                `👥 <b>Guests:</b> ${order.guestCount}\n` +
                `🏗️ <b>Tiers:</b> ${order.tierCount}\n`;

            if (order.quotedPrice) {
                msg += `💰 <b>Price:</b> ${order.quotedPrice.toLocaleString()} ETB\n`;
            }
            if (order.deliveryOption === "delivery" && order.deliveryAddress) {
                msg += `📍 <b>Address:</b> ${order.deliveryAddress}\n`;
            }

            return ctx.reply(msg, { parse_mode: "HTML" });
        }

        const user = await prisma.user.findFirst({ where: { telegramId, deletedAt: null } });

        if (user) {
            await ctx.reply(
                `Welcome back, <b>${user.name}</b>! 🎂\n\n` +
                    `I'm Yodit's Cake Helper, your Flavour Bites assistant.\n\n` +
                    `<b>What I can do:</b>\n` +
                    `• /status — check your current orders\n` +
                    `• /order — start a new cake request\n` +
                    `• /help — see all commands`,
                { parse_mode: "HTML" },
            );
        } else {
            await ctx.reply(
                `Hello! 👋 I'm <b>Yodit's Apprentice</b>, the bot for <b>Flavour Bites</b> — a bespoke cake boutique in Bole, Addis Ababa.\n\n` +
                    `To use me fully, you'll need to link your account. Visit our website and sign in with Telegram:\n` +
                    `<b>👉 flavourbites.com</b>\n\n` +
                    `Once linked, you can check your order status and get updates right here.`,
                { parse_mode: "HTML" },
            );
        }
    });

    bot.command("status", async (ctx) => {
        const telegramId = String(ctx.from?.id);
        const prisma = getPrisma();

        const user = await prisma.user.findFirst({
            where: { telegramId, deletedAt: null },
            include: {
                requests: {
                    where: {
                        status: { notIn: ["Completed", "Cancelled"] },
                    },
                    orderBy: { createdAt: "desc" },
                    take: 5,
                },
            },
        });

        if (!user) {
            return ctx.reply(
                "⚠️ Your Telegram account isn't linked yet.\n\nVisit <b>flavourbites.com</b> and sign in with Telegram to link your account.",
                { parse_mode: "HTML" },
            );
        }

        if (user.requests.length === 0) {
            return ctx.reply(
                `Hi <b>${user.name}</b>! You have no active orders right now.\n\nUse /order to start a new cake request. 🎂`,
                { parse_mode: "HTML" },
            );
        }

        const statusEmoji: Record<string, string> = {
            Received: "📬",
            Designing: "✏️",
            Quoted: "💰",
            Confirmed: "✅",
            InProgress: "🔥",
            Ready: "🎂",
        };

        const lines = user.requests.map((r, i) => {
            const emoji = statusEmoji[r.status] ?? "📦";
            return (
                `<b>${i + 1}. ${r.eventType} Cake</b>\n` +
                `   ${emoji} ${r.status}\n` +
                `   📅 ${r.deliveryDate}\n` +
                `   🆔 <code>${r.id}</code>`
            );
        });

        await ctx.reply(
            `Hi <b>${user.name}</b>! Here are your active orders:\n\n${lines.join("\n\n")}`,
            { parse_mode: "HTML" },
        );
    });

    bot.command("help", async (ctx) => {
        await ctx.reply(
            `<b>Flavour Bites Bot — Commands</b>\n\n` +
                `/start — Welcome message\n` +
                `/status — Check your active orders\n` +
                `/order — Start a new cake request\n` +
                `/help — This message\n\n` +
                `For questions, visit <b>flavourbites.com</b> or call us directly.`,
            { parse_mode: "HTML" },
        );
    });

    // ─── /order ────────────────────────────────────────────────────────────────
    bot.command("order", async (ctx) => {
        const telegramId = String(ctx.from?.id);
        const prisma = getPrisma();

        const user = await prisma.user.findFirst({ where: { telegramId, deletedAt: null } });

        if (!user) {
            return ctx.reply(
                "⚠️ Your Telegram account isn't linked yet.\n\nVisit <b>flavourbites.com</b> and sign in with Telegram to link your account.",
                { parse_mode: "HTML" },
            );
        }

        const conv: OrderConversation = {
            step: "eventType",
            userId: user.id,
            contactName: user.name,
            contactPhone: user.telegramPhone || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await conversationStore.setOrder(telegramId, conv);

        await ctx.reply(
            `🎂 <b>Let's make your cake!</b>\n\n` +
                `I'll ask you a few simple questions.\n\n` +
                `<b>1.</b> What type of event is this?\n` +
                `(e.g., Birthday, Wedding, Anniversary, etc.)`,
            { parse_mode: "HTML" },
        );
    });

    // ─── Handle conversation replies for /order ──────────────────────────────
    bot.on("message:text", async (ctx) => {
        const telegramId = String(ctx.from?.id);
        const conv = await conversationStore.getOrder(telegramId);
        if (!conv) return;

        const text = ctx.message.text.trim();
        const prisma = getPrisma();

        switch (conv.step) {
            case "eventType":
                conv.eventType = text;
                conv.step = "deliveryDate";
                await conversationStore.setOrder(telegramId, conv);
                await ctx.reply(
                    `Great, a <b>${text}</b> cake! 🎉\n\n<b>2.</b> What date do you need it by?\n` +
                        `(e.g., July 15, 2026)`,
                    { parse_mode: "HTML" },
                );
                break;

            case "deliveryDate":
                conv.deliveryDate = text;
                conv.step = "guestCount";
                await conversationStore.setOrder(telegramId, conv);
                await ctx.reply(
                    `📅 <b>${text}</b> — noted!\n\n<b>3.</b> How many guests will the cake serve?`,
                    { parse_mode: "HTML" },
                );
                break;

            case "guestCount": {
                const count = parseInt(text, 10);
                if (isNaN(count) || count < 1) {
                    return ctx.reply(
                        "⚠️ Please enter a valid number of guests (e.g. 25).",
                    );
                }
                conv.guestCount = count;
                conv.step = "flavor";
                await conversationStore.setOrder(telegramId, conv);
                await ctx.reply(
                    `👥 ${count} guests — perfect!\n\n<b>4.</b> What flavor would you like?\n` +
                        `(e.g., Madagascar Vanilla Bean, Rich Chocolate Ganache, Salted Caramel Pecan)`,
                    { parse_mode: "HTML" },
                );
                break;
            }

            case "flavor":
                conv.flavor = text;
                conv.step = "tierCount";
                await conversationStore.setOrder(telegramId, conv);
                await ctx.reply(
                    `🍰 <b>${text}</b> — delicious choice!\n\n<b>5.</b> How many tiers? (1-4)`,
                    { parse_mode: "HTML" },
                );
                break;

            case "tierCount": {
                const tiers = parseInt(text, 10);
                if (isNaN(tiers) || tiers < 1 || tiers > 4) {
                    return ctx.reply(
                        "⚠️ Please enter a number between 1 and 4.",
                    );
                }
                conv.tierCount = tiers;
                conv.step = "designStyle";
                await conversationStore.setOrder(telegramId, conv);
                await ctx.reply(
                    `${tiers} tier${tiers > 1 ? "s" : ""} — noted!\n\n<b>6.</b> Any particular design style or theme?\n` +
                        `(e.g., modern gold edges, floral, minimalist, character theme)`,
                    { parse_mode: "HTML" },
                );
                break;
            }

            case "designStyle":
                conv.designStyle = text;
                conv.step = "deliveryOption";
                await conversationStore.setOrder(telegramId, conv);
                await ctx.reply(
                    `🎨 Nice.\n\n<b>7.</b> Will this be <b>pickup</b> from our Bole studio or <b>delivery</b>?\n` +
                        `Reply "pickup" or "delivery".`,
                    { parse_mode: "HTML" },
                );
                break;

            case "deliveryOption": {
                const option = text.toLowerCase();
                if (option !== "pickup" && option !== "delivery") {
                    return ctx.reply(
                        '⚠️ Please reply with "pickup" or "delivery".',
                    );
                }
                conv.deliveryOption = option;
                if (option === "delivery") {
                    conv.step = "deliveryAddress";
                    await conversationStore.setOrder(telegramId, conv);
                    await ctx.reply(
                        `🚗 Delivery it is!\n\n<b>8.</b> What's the delivery address in Addis Ababa?`,
                        { parse_mode: "HTML" },
                    );
                } else {
                    conv.step = "contactPhone";
                    await conversationStore.setOrder(telegramId, conv);
                    await ctx.reply(
                        `🏠 Pickup from our Bole studio!\n\n<b>8.</b> What phone number should we use to reach you?\n` +
                            `(e.g., +251 911 123 456)`,
                        { parse_mode: "HTML" },
                    );
                }
                break;
            }

            case "deliveryAddress":
                conv.deliveryAddress = text;
                conv.step = "contactPhone";
                await conversationStore.setOrder(telegramId, conv);
                await ctx.reply(
                    `📍 Delivery to <b>${text}</b>!\n\n<b>9.</b> What phone number should we use to reach you?\n` +
                        `(e.g., +251 911 123 456)`,
                    { parse_mode: "HTML" },
                );
                break;

            case "contactPhone":
                conv.contactPhone = text;
                conv.step = "specialInstructions";
                await conversationStore.setOrder(telegramId, conv);
                await ctx.reply(
                    `📞 Got it!\n\n<b>10.</b> Any special instructions or dietary needs?\n` +
                        `(Reply "none" if not)`,
                    { parse_mode: "HTML" },
                );
                break;

            case "specialInstructions": {
                conv.specialInstructions = text === "none" ? "" : text;
                conv.step = "done";

                const requestId = `FB-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
                const requestDate = new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                });

                const order = await createOrder(
                    prisma,
                    {
                        id: requestId,
                        userId: conv.userId,
                        contactName: conv.contactName,
                        contactPhone: conv.contactPhone,
                        eventType: conv.eventType || "Custom Order",
                        guestCount: conv.guestCount || 1,
                        deliveryOption: conv.deliveryOption || "pickup",
                        deliveryAddress: conv.deliveryAddress || null,
                        deliveryDate: conv.deliveryDate || "TBD",
                        designStyle: conv.designStyle || "Classic",
                        flavor: conv.flavor || "Vanilla",
                        tierCount: conv.tierCount || 1,
                        specialInstructions: conv.specialInstructions || "",
                        requestDate,
                    },
                    { source: "telegram_bot", userId: conv.userId },
                );

                await conversationStore.clearOrder(telegramId);

                // Notify staff
                notifyStaffNewOrder(order).catch((e) =>
                    console.error(
                        "[Notify] Failed to notify staff of new order:",
                        e.message,
                    ),
                );

                await ctx.reply(
                    `✅ <b>Your cake request has been sent!</b> 🎂\n\n` +
                        `Here's your summary:\n` +
                        `• <b>Event:</b> ${conv.eventType}\n` +
                        `• <b>Date:</b> ${conv.deliveryDate}\n` +
                        `• <b>Guests:</b> ${conv.guestCount}\n` +
                        `• <b>Flavor:</b> ${conv.flavor}\n` +
                        `• <b>Tiers:</b> ${conv.tierCount}\n` +
                        `• <b>Order ID:</b> <code>${requestId}</code>\n\n` +
                        `Yodit will review your request and get back to you soon! Use /status to check your order anytime.`,
                    { parse_mode: "HTML" },
                );
                break;
            }
        }
    });
}
