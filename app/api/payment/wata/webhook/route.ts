import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { wata } from '@/lib/wata';
import { Bot } from 'grammy';
import { sendMetricaHit } from '@/lib/analytics';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID; // Or fetch from settings if preferred

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const signature = req.headers.get('X-Signature');
        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        // We need the raw body for verification
        const rawBody = await req.text();

        // Verify signature
        const isValid = await wata.verifyWebhook(rawBody, signature);
        if (!isValid) {
            console.error('Invalid Wata Webhook Signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const body = JSON.parse(rawBody);

        // Wata Webhook Payload Example:
        // {
        //   "transactionId": "...",
        //   "transactionStatus": "Paid",
        //   "orderId": "...", // Our public Order ID
        //   "amount": 1188.00,
        //   "currency": "RUB",
        //   ...
        // }

        const { transactionStatus, orderId, transactionId, amount } = body;

        if (transactionStatus !== 'Paid') {
            // We only care about success for now.
            // Wata might send other statuses like 'Created', 'Expired', 'Failed'.
            console.log(`Wata webhook: Status ${transactionStatus} for order ${orderId}`);
            return NextResponse.json({ received: true });
        }

        // Extract internal ID from public Order ID
        // Public ID = Order ID + 27654423
        const ORDER_ID_OFFSET = 27654423;
        const publicOrderId = parseInt(orderId);

        if (isNaN(publicOrderId)) {
            console.error('Invalid Order ID format:', orderId);
            return NextResponse.json({ error: 'Invalid Order ID' }, { status: 400 });
        }

        const internalOrderId = publicOrderId - ORDER_ID_OFFSET;

        // Find Order
        const order = await prisma.order.findUnique({
            where: { id: internalOrderId },
            include: { user: true, product: true, promoCode: true }
        });

        if (!order) {
            console.error('Order not found:', internalOrderId);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.status === 'PAID' || order.status === 'COMPLETED') {
            console.log('Order already paid:', internalOrderId);
            return NextResponse.json({ received: true });
        }

        // Mark as Paid
        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: 'PAID',
                yookassaId: transactionId, // Storing Wata Transaction ID here
                updatedAt: new Date()
            }
        });

        // Mark Promo as Used if applicable
        if (order.promoCodeId) {
            // Check if it was a one-time promo? 
            // Logic says if promoCode is linked, we might want to mark it used.
            // In schema: `isUsed Boolean @default(false)`
            // If the promo is single-use, we should mark it.
            // Assuming current promo logic is single use per user or global?
            // "activatedPromoCodes" vs "usedPromoCodes".
            // Let's mark it as used by this user.

            await prisma.promoCode.update({
                where: { id: order.promoCodeId },
                data: {
                    isUsed: true,
                    usedByUserId: order.userId
                }
            });
        }

        // Notify Admin / Analytics
        // We can send a message via Bot if token is available
        if (TELEGRAM_BOT_TOKEN && ADMIN_ID) {
            try {
                const bot = new Bot(TELEGRAM_BOT_TOKEN);
                const message = `💰 <b>Новая продажа (Wata)!</b>\n\n` +
                    `Заказ: #${publicOrderId}\n` +
                    `Товар: ${order.product.title}\n` +
                    `Сумма: ${amount} RUB\n` +
                    `Пользователь: ${order.user.email || order.user.telegramId || 'Unknown'}\n` +
                    `ID транзакции: ${transactionId}`;
                await bot.api.sendMessage(ADMIN_ID, message, { parse_mode: 'HTML' });
            } catch (e) {
                console.error('Failed to send admin notification', e);
            }
        }

        // Notify User (if Telegram ID exists)
        if (order.user.telegramId && TELEGRAM_BOT_TOKEN) {
            try {
                const bot = new Bot(TELEGRAM_BOT_TOKEN);
                const message = `✅ <b>Оплата прошла успешно!</b>\n\n` +
                    `Ваш заказ #${publicOrderId} оплачен.\n` +
                    `Товар: ${order.product.title}\n\n` +
                    `Спасибо за покупку!`;
                await bot.api.sendMessage(order.user.telegramId, message, { parse_mode: 'HTML' });
            } catch (e) {
                console.error('Failed to send user notification', e);
            }
        }




        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
