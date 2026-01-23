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
        // If order source is WEB, send distinct goal
        const target = order.source === 'WEB' ? 'payment_success_site' : 'payment_success';

        await sendMetricaHit({
            clientId: order.user.yandexClientId,
            target,
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
