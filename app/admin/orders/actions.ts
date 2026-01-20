'use server';

import { prisma } from '@/lib/prisma';
import { sendMetricaHit } from '@/lib/analytics';
import { revalidatePath } from 'next/cache';

export async function sendManualRevenue(orderId: number, amount: number) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true }
        });

        if (!order) {
            return { error: 'Заказ не найден' };
        }

        if (order.isRevenueSent) {
            return { error: 'Доход уже отправлен' };
        }

        if (!order.user.yandexClientId) {
            return { error: 'У пользователя нет Yandex Client ID' };
        }

        // Send to Metrica
        await sendMetricaHit({
            clientId: order.user.yandexClientId,
            target: 'payment_success',
            revenue: amount
        });

        // Update Order
        await prisma.order.update({
            where: { id: orderId },
            data: {
                isRevenueSent: true,
                sentRevenueAmount: amount
            }
        });

        revalidatePath('/admin/orders');
        return { success: true };

    } catch (e) {
        console.error('Failed to send manual revenue:', e);
        return { error: 'Ошибка отправки: ' + (e as Error).message };
    }
}
