'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const type = formData.get('type') as string;
    const imageUrl = formData.get('imageUrl') as string;

    await prisma.product.create({
        data: {
            title,
            description,
            price,
            type,
            imageUrl: imageUrl || null,
            isActive: true, // Default to true
        },
    });

    revalidatePath('/admin/products');
    redirect('/admin/products');
}

export async function toggleProductStatus(id: number, isActive: boolean) {
    await prisma.product.update({
        where: { id },
        data: { isActive },
    });
    revalidatePath('/admin/products');
}

export async function deleteProduct(id: number) {
    await prisma.product.delete({
        where: { id },
    });
    revalidatePath('/admin/products');
}
