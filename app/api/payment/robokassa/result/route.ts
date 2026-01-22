import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSignature } from '@/lib/robokassa';
import { bot } from '@/bot'; // Import bot instance to notify user/admin

// Use force-dynamic to ensure it's not cached
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        // Robokassa sends data via POST usually
        const contentType = req.headers.get('content-type') || '';
        const formData = await req.text(); // Parse body text
        const params = new URLSearchParams(formData);

        const outSum = params.get('OutSum');
        const invId = params.get('InvId');
        const signature = params.get('SignatureValue');

        if (!outSum || !invId || !signature) {
            console.error('Webhook POST: Missing parameters', { outSum, invId, signature });
            return new NextResponse('Missing parameters', { status: 400 });
        }

        const validSignature = validateSignature(outSum, invId, signature);
        if (!validSignature) {
            console.error('Webhook POST: Bad signature', { outSum, invId, signature });
            return new NextResponse('Bad signature', { status: 400 });
        }

        // InvId from Robokassa is now the Public Order ID
        const publicOrderId = parseInt(invId, 10);
        const ORDER_ID_OFFSET = 27654423;
        const internalId = publicOrderId - ORDER_ID_OFFSET; // Convert back to DB ID

        // Find Order
        const order = await prisma.order.findUnique({
            where: { id: internalId },
            include: { user: true, product: true }
        });

        if (!order) {
            console.error('Webhook POST: Order not found', internalId);
            return new NextResponse('Order not found', { status: 400 });
        }

        // Check if already paid to avoid double processing
        if (order.status === 'PAID' || order.status === 'COMPLETED') {
            return new NextResponse(`OK${invId}`, { status: 200 });
        }

        // Verify amount (optional but recommended)
        if (Math.abs(order.amount - parseFloat(outSum)) > 0.01) {
            console.error('Webhook POST: Amount mismatch', { orderAmount: order.amount, outSum });
            return new NextResponse('Amount mismatch', { status: 400 });
        }

        // Update Order
        await prisma.order.update({
            where: { id: internalId },
            data: {
                status: 'PAID',
                updatedAt: new Date()
            }
        });

        // Mark promo code as used if applicable
        if (order.promoCodeId) {
            await prisma.promoCode.update({
                where: { id: order.promoCodeId },
                data: {
                    isUsed: true,
                    usedByUserId: order.userId
                }
            });
        }

        // Send Analytics


        // Notify User
        // Notify User
        if (order.user.telegramId) {
            try {
                await bot.api.sendMessage(
                    order.user.telegramId,
                    `✅ Оплата прошла успешно!\n` +
                    `Заказ #${publicOrderId} оплачен.\n` +
                    `Товар: ${order.product.title}\n` +
                    `Свяжитесь с менеджером для получения товара, отправив номер заказа - @manager_gptsub\n\n` +
                    `Спасибо за покупку!`
                );
            } catch (e) {
                console.error('Failed to notify user about payment:', e);
            }
        }

        return new NextResponse(`OK${invId}`, { status: 200 });

    } catch (error) {
        console.error('Robokassa Callback Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// Also support GET for testing or simple callbacks? 
// Robokassa usually POSTs to ResultURL.
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const outSum = searchParams.get('OutSum');
        const invId = searchParams.get('InvId');
        const signature = searchParams.get('SignatureValue');

        if (!outSum || !invId || !signature) {
            console.error('Webhook GET: Missing parameters', { outSum, invId, signature });
            return new NextResponse('Missing parameters', { status: 400 });
        }

        if (!validateSignature(outSum, invId, signature)) {
            console.error('Webhook GET: Bad signature', { outSum, invId, signature });
            return new NextResponse('Bad signature', { status: 400 });
        }

        const publicOrderId = parseInt(invId, 10);
        const ORDER_ID_OFFSET = 27654423;
        const internalId = publicOrderId - ORDER_ID_OFFSET;

        const order = await prisma.order.findUnique({
            where: { id: internalId },
            include: { user: true, product: true }
        });

        if (!order) {
            console.error('Webhook GET: Order not found', internalId);
            return new NextResponse('Order not found', { status: 400 });
        }

        if (order.status === 'PAID' || order.status === 'COMPLETED') return new NextResponse(`OK${invId}`, { status: 200 });

        if (Math.abs(order.amount - parseFloat(outSum)) > 0.01) {
            console.error('Webhook GET: Amount mismatch', { orderAmount: order.amount, outSum });
            return new NextResponse('Amount mismatch', { status: 400 });
        }

        await prisma.order.update({
            where: { id: internalId },
            data: { status: 'PAID', updatedAt: new Date() }
        });

        // Mark promo code as used if applicable
        if (order.promoCodeId) {
            await prisma.promoCode.update({
                where: { id: order.promoCodeId },
                data: {
                    isUsed: true,
                    usedByUserId: order.userId
                }
            });
        }

        // Send Analytics


        if (order.user.telegramId) {
            try {
                await bot.api.sendMessage(
                    order.user.telegramId,
                    `✅ Оплата прошла успешно!\n` +
                    `Заказ #${publicOrderId} оплачен.\n` +
                    `Товар: ${order.product.title}\n` +
                    `Свяжитесь с менеджером для получения товара, отправив номер заказа - @manager_gptsub\n\n` +
                    `Спасибо за покупку!`
                );
            } catch (e) { console.error(e); }
        }

        return new NextResponse(`OK${invId}`, { status: 200 });
    } catch (e) {
        console.error('Webhook GET Error:', e);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
