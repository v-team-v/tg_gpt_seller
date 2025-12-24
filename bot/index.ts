import { Bot, session, Context, SessionFlavor } from 'grammy';
import { prisma } from '@/lib/prisma';

interface SessionData { }
type MyContext = Context & SessionFlavor<SessionData>;

if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not defined');
}

export const bot = new Bot<MyContext>(process.env.TELEGRAM_BOT_TOKEN);

// Install simple session middleware (can be replaced with Redis later)
bot.use(session({ initial: () => ({}) }));

// Logging middleware
bot.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log('Response time %sms', ms);
});

// Start command
bot.command('start', async (ctx) => {
    const user = ctx.from;
    if (!user) return;

    // Upsert user in DB
    await prisma.user.upsert({
        where: { telegramId: user.id.toString() },
        update: {
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
        },
        create: {
            telegramId: user.id.toString(),
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            source: ctx.match ? ctx.match.toString() : null, // Capture deep link param
        },
    });

    await ctx.reply(`Привет, ${user.first_name}! 👋\nДобро пожаловать в магазин ChatGPT Plus.`);
});

// Handle text messages
bot.on('message:text', async (ctx) => {
    const settings = await prisma.settings.findMany();
    const manualMode = settings.find((s: { key: string }) => s.key === 'manual_mode')?.value === 'true';
    const offlineMessage = settings.find((s: { key: string }) => s.key === 'offline_message')?.value || 'Мы пока не в сети. Оставьте сообщение, ответим позже.';
    const adminId = process.env.ADMIN_TELEGRAM_ID;

    if (manualMode) {
        // Online: Forward to admin
        if (adminId) {
            await ctx.forwardMessage(adminId);
            // Optional: Confirm to user "Sent to admin"
        } else {
            console.warn("ADMIN_TELEGRAM_ID not set");
        }
    } else {
        // Offline: Reply with stub
        await ctx.reply(offlineMessage);
        // Forward anyway so admin sees it? User implies "hold user", usually means just auto-reply.
        // We can also save it to DB if we built a chat system, but forwarding is safest backup.
        if (adminId) await ctx.forwardMessage(adminId);
    }
});

// Basic error handler
bot.catch((err) => {
    console.error('Bot Error:', err);
});
