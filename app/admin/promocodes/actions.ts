'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'crypto';

export async function createPromoCode(amount: number, comment?: string) {
    try {
        // Generate a random code, e.g., "PROMO-A1B2C3"
        const uniqueString = randomBytes(3).toString('hex').toUpperCase();
        const code = `PROMO-${uniqueString}`;

        await prisma.promoCode.create({
            data: {
                code,
                discountAmount: amount,
                comment,
            },
        });

        revalidatePath('/admin/promocodes');
        return { success: true };
    } catch (error) {
        console.error('Failed to create promo code:', error);
        return { success: false, error: 'Failed to create promo code' };
    }
}

export async function deletePromoCode(id: number) {
    try {
        await prisma.promoCode.delete({
            where: { id },
        });

        revalidatePath('/admin/promocodes');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete promo code:', error);
        return { success: false, error: 'Failed to delete promo code' };
    }
}

export async function updatePromoComment(id: number, comment: string) {
    try {
        await prisma.promoCode.update({
            where: { id },
            data: { comment },
        });

        revalidatePath('/admin/promocodes');
        return { success: true };
    } catch (error) {
        console.error('Failed to update promo code comment:', error);
        return { success: false, error: 'Failed to update comment' };
    }
}
