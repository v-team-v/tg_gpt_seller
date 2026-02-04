'use server';

import { prisma } from '@/lib/prisma';
import { generatePaymentUrl } from '@/lib/robokassa';

interface WebOrderData {
    productId: number;
    email: string;
    firstName?: string;
    promoCode?: string;
    yandexClientId?: string;
    sessionToken?: string;
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

// Wata.pro Integration
import { wata } from '@/lib/wata';

export async function createWebOrder(data: WebOrderData) {
    try {
        const { productId, email, firstName, promoCode, yandexClientId, sessionToken } = data;

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
        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
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
                return { error: 'Ошибка создания пользователя' };
            }
        } else {
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
                promoCodeId,
                sessionToken
            }
        });

        // 5. Generate Payment Link (Wata.pro)
        const ORDER_ID_OFFSET = 27654423;
        const publicOrderId = order.id + ORDER_ID_OFFSET;

        const payment = await wata.createPaymentLink({
            amount: finalAmount,
            orderId: String(publicOrderId),
            description: `Оплата заказа #${publicOrderId} (${product.title})`,
            // successRedirectUrl is configured in dashboard, but can be overridden:
            // successRedirectUrl: `https://gpt-plus.pro/payment/success?InvId=${publicOrderId}`,
            // Let's rely on dashboard or pass explicit to be safe if dashboard fails?
            // Docs say dashboard settings are used if not passed.
            // Assuming Success Page needs InvId to identify order.
            // Wata might NOT append query params automatically to dashboard URL.
            // BETTER: Explicitly pass success URL with our params.
            successRedirectUrl: `https://gpt-plus.pro/payment/success?InvId=${publicOrderId}`,
        });

        return { success: true, url: payment.url };

    } catch (error) {
        console.error('Create Web Order Error:', error);
        return { error: 'Ошибка при создании заказа' };
    }
}
