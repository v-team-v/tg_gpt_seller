import { Bot, session, Context, SessionFlavor, InlineKeyboard, Keyboard } from 'grammy';
import { prisma } from '../lib/prisma';

interface SessionData { }
type MyContext = Context & SessionFlavor<SessionData>;


const token = process.env.TELEGRAM_BOT_TOKEN || 'dummy_token_for_build';

if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN is not defined. Using dummy token for build/dev.');
}

export const bot = new Bot<MyContext>(token);

// Install simple session middleware
bot.use(session({ initial: () => ({}) }));

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
        .text("Как происходит активация").text("Профиль").row()
        .text("Поддержка").resized();
};

// Start command
bot.command('start', async (ctx) => {
    const user = ctx.from;
    if (!user) return;

    let source = ctx.match ? ctx.match.toString() : null;
    let yandexClientId = null;

    // Check for Yandex Metrica deep link (ym_...)
    if (source && source.startsWith('ym_')) {
        const rawId = source.replace(/^ym_/, '');
        // Restore dots: ym_123_456 -> 123.456
        yandexClientId = rawId.replace(/_/, '.');
    }

    // Upsert User
    await prisma.user.upsert({
        where: { telegramId: user.id.toString() },
        update: {
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            source: source,
            yandexClientId: yandexClientId,
        },
        create: {
            telegramId: user.id.toString(),
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            source: source,
            yandexClientId: yandexClientId,
        },
    });

    const settings = await prisma.settings.findMany();
    const getVal = (key: string) => settings.find(s => s.key === key)?.value;

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

// 1. ChatGPT Plus (Catalog Category)
bot.hears("ChatGPT Plus", async (ctx) => {
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
        keyboard.text(`${p.title} - ${p.price} ₽`, `view_product_${p.id}`).row();
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


// --- Inline Query Handlers ---

// View Product Detail
bot.callbackQuery(/view_product_(\d+)/, async (ctx) => {
    const productId = parseInt(ctx.match[1]);
    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
        await ctx.answerCallbackQuery("Товар не найден");
        return;
    }

    await ctx.answerCallbackQuery();
    try {
        await ctx.deleteMessage();
    } catch (e) {
        // Ignore delete error (message too old, etc)
    }
    // User requested "Click on name -> Go to full description". 
    // Let's delete the list or edit it? Getting "back" button is good practice then.
    // For simplicity, let's send a new message.

    // Updated Buttons: "Select this product" and "Back"
    const keyboard = new InlineKeyboard()
        .text("Выбрать этот товар", `create_order_${product.id}`).row()
        .text("Назад", "back_to_catalog");

    const caption = `<b>${product.title}</b>\n\n${product.description}\n\nЦена: <b>${product.price} ₽</b>`;

    if (product.imageUrl) {
        // Handle local file uploads
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
    await ctx.answerCallbackQuery();
    try {
        await ctx.deleteMessage();
    } catch (e) {
        // Ignore
    }
    // Trigger catalog display logic (reuse code or call logic?)
    // Re-sending catalog:
    const products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
    });
    const keyboard = new InlineKeyboard();
    products.forEach(p => {
        keyboard.text(`${p.title} - ${p.price} ₽`, `view_product_${p.id}`).row();
    });
    await ctx.reply("Выберите тариф:", { reply_markup: keyboard });
});


// Create Order & Show Invoice
bot.callbackQuery(/create_order_(\d+)/, async (ctx) => {
    const productId = parseInt(ctx.match[1]);
    const userId = ctx.from.id.toString();

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
        await ctx.answerCallbackQuery("Товар не найден");
        return;
    }

    // Find DB User
    const dbUser = await prisma.user.findUnique({ where: { telegramId: userId } });
    if (!dbUser) {
        // Should exist from /start, but separate checks are good.
        await ctx.answerCallbackQuery("Пользователь не найден. Введите /start");
        return;
    }

    // Create Order
    const order = await prisma.order.create({
        data: {
            userId: dbUser.id,
            productId: product.id,
            amount: product.price,
            status: "PENDING"
        }
    });

    await ctx.answerCallbackQuery();
    // await ctx.deleteMessage(); // Optional: remove product card? Or keep history. 
    // Usually invoice is a new distinct step. Let's delete to keep clean? 
    // Requests says "after pressing... show message...".
    // I'll delete the product card to focus on payment.
    try {
        await ctx.deleteMessage();
    } catch (e) {
        // Ignore
    }

    // Obfuscate Order ID
    const publicOrderId = 27654423 + order.id;

    // Formatting date time for "actuality"
    const now = new Date();
    const until = new Date(now.getTime() + 15 * 60000); // +15 mins
    const timeString = until.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    const text =
        `➖➖➖➖➖➖➖➖➖➖➖
<b>Товар:</b> ${product.title}
<b>Цена:</b> ${product.price} ₽
<b>Заказ:</b> ${publicOrderId}
➖➖➖➖➖➖➖➖➖➖➖
Для оплаты перейдите по ссылке!
Счет на оплату актуален 15 минут
Необходимо оплатить до ${timeString}
➖➖➖➖➖➖➖➖➖➖➖`;

    // Payment Button
    const { generatePaymentUrl } = require('../lib/robokassa');
    const paymentUrl = generatePaymentUrl({
        amount: product.price,
        orderId: publicOrderId, // Use Public ID for Robokassa
        description: `Оплата заказа #${publicOrderId} (ChatGPT Plus)`
    });

    const keyboard = new InlineKeyboard()
        .url(`Оплатить ${product.price} ₽`, paymentUrl);

    await ctx.reply(text, { parse_mode: "HTML", reply_markup: keyboard });
});

// History Handler
bot.callbackQuery("history", async (ctx) => {
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

    // Status Translation
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
    const menuCommands = ["ChatGPT Plus", "Как происходит активация", "Профиль", "Поддержка"];
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

