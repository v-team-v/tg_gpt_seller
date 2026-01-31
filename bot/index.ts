// 6. Analytics
import { Bot, session, Context, SessionFlavor, InlineKeyboard, Keyboard } from 'grammy';
import { sendMetricaHit } from '../lib/analytics';
import { prisma } from '../lib/prisma';
import { wata } from '../lib/wata';

interface SessionData {
    step?: 'WAITING_FOR_PROMO';
}
type MyContext = Context & SessionFlavor<SessionData>;


const token = process.env.TELEGRAM_BOT_TOKEN || 'dummy_token_for_build';

if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN is not defined. Using dummy token for build/dev.');
}

export const bot = new Bot<MyContext>(token);

// Install simple session middleware
bot.use(session({ initial: () => ({}) }));

// Middleware: Track Last Seen
bot.use(async (ctx, next) => {
    // DEBUG LOG - Unconditional
    console.log('[Middleware] Traffic detected');

    if (ctx.from) {
        const userId = ctx.from.id.toString();
        // DEBUG LOG
        console.log(`[Middleware] Updating lastSeen for ${userId}`);

        prisma.user.updateMany({
            where: { telegramId: userId },
            data: { lastSeen: new Date() }
        }).catch(err => console.error("Failed to update lastSeen:", err));
    }
    await next();
});

// Logging
bot.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log('Response time %sms', ms);
});


// Wrapper to initialize background jobs and settings
export async function initBot() {
    // Sync Bot "Description"
    try {
        const settings = await prisma.settings.findUnique({ where: { key: 'start_description' } });
        if (settings?.value) {
            await bot.api.setMyDescription(settings.value);
            console.log("Updated Bot Description from DB");
        }
    } catch (e) {
        console.error("Failed to sync description:", e);
    }

    // Start CRON / Interval Jobs
    startCronJobs();
}



// --- Text & Keyboard Logic ---

const getMainMenu = () => {
    return new Keyboard()
        .text("ChatGPT Plus").row()
        .text("Промокод").row()
        .text("Как происходит активация").text("Профиль").row()
        .text("Поддержка").resized();
};

// Start command
bot.command('start', async (ctx) => {
    const user = ctx.from;
    if (!user) return;

    const startPayload = ctx.match ? ctx.match.toString() : null;
    let yandexClientId = null;

    // Check for Yandex Metrica deep link (ym_...)
    if (startPayload && startPayload.startsWith('ym_')) {
        const rawId = startPayload.replace(/^ym_/, '');
        // Restore dots: ym_123_456 -> 123.456
        yandexClientId = rawId.replace(/_/, '.');
    }

    // Upsert User
    // Upsert User
    const updateData: any = {
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        source: 'BOT',
        lastSeen: new Date(),
    };

    if (yandexClientId) {
        updateData.yandexClientId = yandexClientId;
    }

    await prisma.user.upsert({
        where: { telegramId: user.id.toString() },
        update: updateData,
        create: {
            telegramId: user.id.toString(),
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            source: 'BOT',
            yandexClientId: yandexClientId,
            lastSeen: new Date(),
        },
    });

    const settings = await prisma.settings.findMany();
    const getVal = (key: string) => settings.find(s => s.key === key)?.value;

    // Analytics: hit bot_start
    await sendMetricaHit({
        clientId: yandexClientId || user.id.toString(),
        target: 'bot_start',
        label: startPayload || 'direct'
    });

    const welcomeMsg = getVal('welcome_message') || `Привет, ${user.first_name}! 👋\nДобро пожаловать в магазин ChatGPT Plus.`;
    const welcomeImg = getVal('welcome_image');

    if (welcomeImg) {
        // Need absolute path or URL?
        // Local file path relative to execution? No, grammy needs InputFile from local path or URL.
        // If we use URL (http://localhost:3000/...), bot needs to reach it.
        // During local dev, bot cannot reach localhost:3000 if not configured.
        // BUT we are running locally. We can pass the absolute file path.
        // The image is saved in `public/uploads/...`.
        // Absolute path: process.cwd() + '/public' + welcomeImg

        const fs = require('fs');
        const path = require('path');
        const { InputFile } = require('grammy');

        const absolutePath = path.join(process.cwd(), 'public', welcomeImg);

        if (fs.existsSync(absolutePath)) {
            await ctx.replyWithPhoto(new InputFile(absolutePath), {
                caption: welcomeMsg,
                reply_markup: getMainMenu()
            });
        } else {
            await ctx.reply(welcomeMsg, { reply_markup: getMainMenu() });
        }
    } else {
        await ctx.reply(welcomeMsg, {
            reply_markup: getMainMenu()
        });
    }
});

bot.hears("ChatGPT Plus", async (ctx) => {
    if (!ctx.from) return;
    const userId = ctx.from.id.toString();

    // Check for active promo
    const dbUser = await prisma.user.findUnique({
        where: { telegramId: userId },
        include: { activatedPromoCodes: true }
    });
    const activePromo = dbUser?.activatedPromoCodes.find(p => !p.isUsed);

    const products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
    });

    if (products.length === 0) {
        await ctx.reply("Товары пока не добавлены.");
        return;
    }

    const keyboard = new InlineKeyboard();
    products.forEach(p => {
        let label = `${p.title} - ${p.price} ₽`;
        if (activePromo) {
            const discounted = Math.max(0, p.price - activePromo.discountAmount);
            label = `${p.title} - ${discounted} ₽ (было ${p.price})`;
        }
        keyboard.text(label, `view_product_${p.id}`).row();
    });

    await ctx.reply("Выберите тариф:", { reply_markup: keyboard });
});

// 2. Activation Info
bot.hears("Как происходит активация", async (ctx) => {
    const settings = await prisma.settings.findMany(); // Optimization: better to fetch all settings once or cache? For now fine.
    const getVal = (key: string) => settings.find(s => s.key === key)?.value;

    const text = getVal('activation_info') || "Информация об активации пока не заполнена админом.";
    const image = getVal('activation_image');

    if (image) {
        const fs = require('fs');
        const path = require('path');
        const { InputFile } = require('grammy');
        const absolutePath = path.join(process.cwd(), 'public', image);

        if (fs.existsSync(absolutePath)) {
            await ctx.replyWithPhoto(new InputFile(absolutePath), {
                caption: text
            });
        } else {
            await ctx.reply(text);
        }
    } else {
        await ctx.reply(text);
    }
});

// 3. Profile
bot.hears("Профиль", async (ctx) => {
    const user = ctx.from;
    const dbUser = await prisma.user.findUnique({
        where: { telegramId: user?.id.toString() },
        include: { orders: true }
    });

    const settings = await prisma.settings.findUnique({ where: { key: 'rules_url' } });
    const rulesUrl = settings?.value || "https://google.com";

    const completedOrders = dbUser?.orders.filter(o => o.status === 'COMPLETED' || o.status === 'PAID').length || 0;

    // Simple profile stats
    const text = `👤 <b>Мой профиль:</b>\n\nID: <code>${user?.id}</code>\nИмя: ${user?.first_name}\nВсего заказов: ${completedOrders}`;

    const keyboard = new InlineKeyboard()
        .text("📦 История заказов", "history")
        .url("📜 Пользовательское соглашение (Оферта)", rulesUrl);

    await ctx.reply(text, { parse_mode: "HTML", reply_markup: keyboard });
});


// 4. Support
bot.hears("Поддержка", async (ctx) => {
    const settings = await prisma.settings.findUnique({ where: { key: 'support_url' } });
    const supportUrl = settings?.value || "https://t.me/username";

    const keyboard = new InlineKeyboard()
        .url("👨‍💻 Написать менеджеру", supportUrl);

    await ctx.reply("Если у вас возникли вопросы, нажмите кнопку ниже, чтобы связаться с поддержкой:", {
        reply_markup: keyboard
    });
});


// 5. Promo Code Section
bot.hears("Промокод", async (ctx) => {
    const user = ctx.from;

    // Check for active promo
    const dbUser = await prisma.user.findUnique({
        where: { telegramId: user?.id.toString() },
        include: { activatedPromoCodes: true }
    });

    // We assume user can have only one active promo code at a time or we take the first one
    const activePromo = dbUser?.activatedPromoCodes.find(p => !p.isUsed);

    if (activePromo) {
        const text = `🎟 <b>Ваш промокод:</b> <code>${activePromo.code}</code>\n` +
            `Скидка: <b>${activePromo.discountAmount} ₽</b>\n` +
            `Статус: ✅ Активирован (зарезервирован за вами)\n\n` +
            `Скидка автоматически применится при выборе товара.`;

        const keyboard = new InlineKeyboard()
            .text("❌ Отменить промокод", `cancel_promo_${activePromo.id}`);

        await ctx.reply(text, { parse_mode: "HTML", reply_markup: keyboard });
    } else {
        const text = "У вас нет активного промокода.";
        const keyboard = new InlineKeyboard()
            .text("✍️ Ввести промокод", "enter_promo");

        await ctx.reply(text, { reply_markup: keyboard });
    }
});

bot.callbackQuery("enter_promo", async (ctx) => {
    ctx.session.step = "WAITING_FOR_PROMO";
    await ctx.answerCallbackQuery();
    await ctx.reply("Пожалуйста, введите код купона:");
});

bot.callbackQuery(/cancel_promo_(\d+)/, async (ctx) => {
    const promoId = parseInt(ctx.match[1]);

    // Unlink from user
    await prisma.promoCode.update({
        where: { id: promoId },
        data: { activatedByUserId: null }
    });

    await ctx.answerCallbackQuery("Промокод отменен");
    await ctx.reply("Промокод успешно отменен. Теперь вы можете ввести другой.");
});

// --- Inline Query Handlers ---

// View Product Detail
bot.callbackQuery(/view_product_(\d+)/, async (ctx) => {
    const productId = parseInt(ctx.match[1]);
    const userId = ctx.from.id.toString();

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
        await ctx.answerCallbackQuery("Товар не найден");
        return;
    }

    // Check for active promo
    const dbUser = await prisma.user.findUnique({
        where: { telegramId: userId },
        include: { activatedPromoCodes: true }
    });
    const activePromo = dbUser?.activatedPromoCodes.find(p => !p.isUsed);

    let priceDisplay = `<b>${product.price} ₽</b>`;
    let finalPrice = product.price;

    if (activePromo) {
        finalPrice = Math.max(0, product.price - activePromo.discountAmount);
        priceDisplay = `<s>${product.price} ₽</s> <b>${finalPrice} ₽</b> 🔥 (Скидка ${activePromo.discountAmount}₽)`;
    }

    await ctx.answerCallbackQuery();
    try {
        await ctx.deleteMessage();
    } catch (e) { }

    const keyboard = new InlineKeyboard()
        .text("Выбрать этот товар", `create_order_${product.id}`).row()
        .text("Назад", "back_to_catalog");

    // Analytics: view_product
    const viewingUser = await prisma.user.findUnique({ where: { telegramId: userId } });
    await sendMetricaHit({
        clientId: viewingUser?.yandexClientId || userId,
        target: 'view_product',
        label: product.title
    });

    const caption = `<b>${product.title}</b>\n\n${product.description}\n\nЦена: ${priceDisplay}`;

    if (product.imageUrl) {
        const fs = require('fs');
        const path = require('path');
        const { InputFile } = require('grammy');
        const absolutePath = path.join(process.cwd(), 'public', product.imageUrl);

        if (fs.existsSync(absolutePath)) {
            try {
                await ctx.replyWithPhoto(new InputFile(absolutePath), {
                    caption: caption,
                    parse_mode: "HTML",
                    reply_markup: keyboard
                });
            } catch (e) {
                console.error("Failed to send photo:", e);
                await ctx.reply(caption, { parse_mode: "HTML", reply_markup: keyboard });
            }
        } else {
            await ctx.reply(caption, { parse_mode: "HTML", reply_markup: keyboard });
        }
    } else {
        await ctx.reply(caption, {
            parse_mode: "HTML",
            reply_markup: keyboard
        });
    }
});

// Back to Catalog
bot.callbackQuery("back_to_catalog", async (ctx) => {
    // Reuse catalog logic but updated with Prices
    const userId = ctx.from.id.toString();
    const dbUser = await prisma.user.findUnique({
        where: { telegramId: userId },
        include: { activatedPromoCodes: true }
    });
    const activePromo = dbUser?.activatedPromoCodes.find(p => !p.isUsed);

    await ctx.answerCallbackQuery();
    try { await ctx.deleteMessage(); } catch (e) { }

    const products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
    });

    const keyboard = new InlineKeyboard();
    products.forEach(p => {
        let label = `${p.title} - ${p.price} ₽`;
        if (activePromo) {
            const discounted = Math.max(0, p.price - activePromo.discountAmount);
            label = `${p.title} - ${discounted} ₽ (было ${p.price})`;
        }
        keyboard.text(label, `view_product_${p.id}`).row();
    });
    await ctx.reply("Выберите тариф:", { reply_markup: keyboard });
});


// Create Order & Show Invoice
// Create Order & Show Invoice
bot.callbackQuery(/create_order_(\d+)/, async (ctx) => {
    const productId = parseInt(ctx.match[1]);
    const userId = ctx.from.id.toString();

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
        await ctx.answerCallbackQuery("Товар не найден");
        return;
    }

    const dbUser = await prisma.user.findUnique({
        where: { telegramId: userId },
        include: { activatedPromoCodes: true }
    });

    if (!dbUser) {
        // Should not happen as middleware/start upserts
        await ctx.answerCallbackQuery("Пользователь не найден");
        return;
    }

    // Apply Promo
    const activePromo = dbUser.activatedPromoCodes.find(p => !p.isUsed);
    let finalAmount = product.price;
    let promoCodeId = null;

    if (activePromo) {
        finalAmount = Math.max(0, product.price - activePromo.discountAmount);
        promoCodeId = activePromo.id;
    }

    // Create Order
    const order = await prisma.order.create({
        data: {
            userId: dbUser.id,
            productId: product.id,
            amount: finalAmount,
            status: "PENDING",
            promoCodeId: promoCodeId
        }
    });

    // Analytics: begin_checkout
    await sendMetricaHit({
        clientId: dbUser.yandexClientId || userId,
        target: 'begin_checkout',
        label: product.title
    });

    await ctx.answerCallbackQuery();
    try { await ctx.deleteMessage(); } catch (e) { }

    const ORDER_ID_OFFSET = 27654423;
    const publicOrderId = order.id + ORDER_ID_OFFSET;

    // Wata Payment Link
    try {
        const payment = await wata.createPaymentLink({
            amount: finalAmount,
            orderId: String(publicOrderId),
            description: `Оплата заказа #${publicOrderId} (${product.title})`,
            successRedirectUrl: `https://gpt-plus.pro/payment/success?InvId=${publicOrderId}`
        });

        let priceLine = `<b>Цена:</b> ${product.price} ₽`;
        if (activePromo) {
            priceLine = `<b>Цена:</b> <s>${product.price} ₽</s> <b>${finalAmount} ₽</b> (Промокод ${activePromo.code})`;
        }

        const text =
            `➖➖➖➖➖➖➖➖➖➖➖
<b>Товар:</b> ${product.title}
${priceLine}
<b>Заказ:</b> #${publicOrderId}
➖➖➖➖➖➖➖➖➖➖➖
Для оплаты нажмите кнопку ниже.
Ссылка действительна 30 минут.
➖➖➖➖➖➖➖➖➖➖➖`;

        const keyboard = new InlineKeyboard()
            .url(`Оплатить ${finalAmount} ₽`, payment.url);

        await ctx.reply(text, { parse_mode: "HTML", reply_markup: keyboard });

    } catch (e) {
        console.error("Payment Link Error:", e);
        await ctx.reply("Произошла ошибка при создании ссылки на оплату. Попробуйте позже.");
    }
});

// ... History Handler ... (unchanged part skipped for brevity, will keep using previous block if not replacing whole)
// Actually I need to be careful with replace_file_content.
// I replaced `// --- Inline Query Handlers ---` down to end.
// I should make sure History and other handlers are preserved or re-added.

// Re-adding History Handler and others
bot.callbackQuery("history", async (ctx) => {
    // ... same as before
    const userId = ctx.from.id.toString();
    const dbUser = await prisma.user.findUnique({
        where: { telegramId: userId },
        include: {
            orders: {
                include: { product: true },
                orderBy: { createdAt: 'desc' },
                take: 10
            }
        }
    });

    if (!dbUser || dbUser.orders.length === 0) {
        await ctx.answerCallbackQuery("История заказов пуста");
        return;
    }

    let text = "📦 <b>История последних заказов:</b>\n\n";

    const statusMap: Record<string, string> = {
        'PENDING': '⏳ Ожидает оплаты',
        'PAID': '✅ Оплачен',
        'COMPLETED': '🚀 Выдан',
        'CANCELED': '❌ Отменен'
    };

    for (const order of dbUser.orders) {
        const publicOrderId = 27654423 + order.id;
        const status = statusMap[order.status] || order.status;
        const date = new Date(order.createdAt).toLocaleDateString('ru-RU', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        text += `🔹 <b>Заказ #${publicOrderId}</b>\n`;
        text += `Товар: ${order.product.title}\n`;
        text += `Статус: ${status}\n`;
        text += `Дата: ${date}\n`;
        text += `➖➖➖➖➖➖➖➖\n`;
    }

    await ctx.reply(text, { parse_mode: "HTML" });
    await ctx.answerCallbackQuery();
});


// --- General Message Handler ---

bot.on('message:text', async (ctx) => {
    const text = ctx.message.text;
    const menuCommands = ["ChatGPT Plus", "Промокод", "Как происходит активация", "Профиль", "Поддержка"];

    // Handle Promo Input
    if (ctx.session.step === 'WAITING_FOR_PROMO') {
        // Reset step
        ctx.session.step = undefined;

        if (menuCommands.includes(text)) {
            // Can pass through to normal handler?
            // Or just return and let user click again?
            // Better to process menu click
        } else {
            // Look up promo
            const promo = await prisma.promoCode.findUnique({
                where: { code: text.trim() }
            });

            if (!promo) {
                await ctx.reply("❌ Промокод не найден.");
                return;
            }

            if (promo.isUsed) {
                await ctx.reply("❌ Этот промокод уже был использован.");
                return;
            }

            if (promo.activatedByUserId) {
                // Check if it's me
                const user = await prisma.user.findUnique({ where: { telegramId: ctx.from.id.toString() } });
                if (promo.activatedByUserId === user?.id) {
                    await ctx.reply("✅ Вы уже активировали этот промокод!");
                } else {
                    await ctx.reply("❌ Этот промокод уже активирован другим пользователем.");
                }
                return;
            }

            // Reserve it
            const user = await prisma.user.findUnique({ where: { telegramId: ctx.from.id.toString() } });
            if (!user) return; // Should not happen

            // Check if user already has active promo? 
            // We can overwrite or prevent? 
            // Let's overwrite (cancel previous implicitely) or just forbid?
            // Prompt said "Active promo...". If I enter new one, I probably want to switch.
            // But strict DB relation might prevent? No 1-to-many.
            // But we want to release old one.

            // Release old promos
            await prisma.promoCode.updateMany({
                where: { activatedByUserId: user.id },
                data: { activatedByUserId: null }
            });

            // Activate new
            await prisma.promoCode.update({
                where: { id: promo.id },
                data: { activatedByUserId: user.id }
            });

            await ctx.reply(`✅ Промокод <b>${promo.code}</b> успешно активирован!\nСкидка <b>${promo.discountAmount} ₽</b> будет применена к следующему заказу.`, { parse_mode: "HTML" });
            return;
        }
    }

    if (menuCommands.includes(text)) return;

    // Auto-reply for unknown text
    await ctx.reply("Пожалуйста, используйте кнопки меню для навигации.");
});


// --- CRON / Interval Jobs ---


function startCronJobs() {
    // Auto-cancel pending orders older than 15 minutes
    setInterval(async () => {
        try {
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

            const expiredOrders = await prisma.order.updateMany({
                where: {
                    status: 'PENDING',
                    createdAt: {
                        lt: fifteenMinutesAgo
                    }
                },
                data: {
                    status: 'CANCELED'
                }
            });

            if (expiredOrders.count > 0) {
                console.log(`Auto-cancelled ${expiredOrders.count} expired orders.`);
            }
        } catch (e) {
            console.error("Error in auto-cancel job:", e);
        }
    }, 60 * 1000); // Run every minute
}


bot.catch((err) => {
    console.error('Bot Error:', err);
});

