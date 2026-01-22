'use server';

import { prisma } from '@/lib/prisma';
import { generatePaymentUrl } from '@/lib/robokassa';

interface WebOrderData {
    productId: number;
    email: string;
    firstName?: string;
    promoCode?: string;
    yandexClientId?: string;
}

export async function checkPromoCode(code: string) {
    try {
        const promo = await prisma.promoCode.findUnique({
            where: { code },
        });

        if (!promo) {
            return { valid: false, error: 'Промокод не найден' };
        }

        if (promo.isUsed) {
            return { valid: false, error: 'Промокод уже использован' };
        }

        return {
            valid: true,
            discountAmount: promo.discountAmount,
            code: promo.code
        };
    } catch (error) {
        console.error('Check Promo Error:', error);
        return { valid: false, error: 'Ошибка проверки промокода' };
    }
}

export async function createWebOrder(data: WebOrderData) {
    try {
        const { productId, email, firstName, promoCode, yandexClientId } = data;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { error: 'Некорректный формат Email' };
        }

        // 1. Validate Product
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return { error: 'Товар не найден' };
        }

        let finalAmount = product.price;
        let promoCodeId: number | null = null;

        // 2. Validate Promo Code
        if (promoCode) {
            const promo = await prisma.promoCode.findUnique({
                where: { code: promoCode },
            });

            if (promo && !promo.isUsed) {
                finalAmount -= promo.discountAmount;
                if (finalAmount < 0) finalAmount = 0; // Prevent negative price
                promoCodeId = promo.id;
            }
        }

        // 3. Find or Create User
        // We use email as the key identifier for web users
        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Note: telegramId is optional now
            try {
                user = await prisma.user.create({
                    data: {
                        email,
                        firstName: firstName || 'Web User',
                        source: 'WEB',
                        yandexClientId
                    }
                });
            } catch (e) {
                console.error('User creation failed', e);
                // Handle race condition or unique constraint violation if needed
                // But finding by email unique should be safe
                return { error: 'Ошибка создания пользователя' };
            }
        } else {
            // Update firstName if provided and not present? Or strictly keep existing?
            // Let's keep existing to rely on "first contact" or update if null.
            if (!user.firstName && firstName) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        firstName: (!user.firstName && firstName) ? firstName : undefined,
                        yandexClientId: yandexClientId || undefined
                    }
                });
            } else if (yandexClientId) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { yandexClientId }
                });
            }
        }

        // 4. Create Order
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                productId: product.id,
                amount: finalAmount,
                status: 'PENDING',
                source: 'WEB',
                promoCodeId
            }
        });

        // 5. Generate Payment Link
        // Public ID logic: offset + ID
        const ORDER_ID_OFFSET = 27654423;
        const publicOrderId = order.id + ORDER_ID_OFFSET;

        const paymentUrl = generatePaymentUrl({
            amount: finalAmount,
            orderId: publicOrderId,
            description: `Оплата заказа #${publicOrderId} (${product.title})`,
            email: email
        });

        return { success: true, url: paymentUrl };

    } catch (error) {
        console.error('Create Web Order Error:', error);
        return { error: 'Ошибка при создании заказа' };
    }
}
