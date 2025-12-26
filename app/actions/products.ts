'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { uploadFile } from '@/lib/upload';

export async function createProduct(formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const type = formData.get('type') as string;

    // Handle Image Upload
    const imageFile = formData.get('image') as File;
    const imageUrl = await uploadFile(imageFile, 'products');

    await prisma.product.create({
        data: {
            title,
            description,
            price,
            type,
            imageUrl,
        },
    });

    revalidatePath('/admin/products');
    redirect('/admin/products');
}

export async function updateProduct(id: number, formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const type = formData.get('type') as string;

    const currentProduct = await prisma.product.findUnique({ where: { id } });

    // Handle Image Upload (only if new file provided)
    const imageFile = formData.get('image') as File;
    let imageUrl = currentProduct?.imageUrl;

    if (imageFile && imageFile.size > 0) {
        const uploadedPath = await uploadFile(imageFile, 'products');
        if (uploadedPath) imageUrl = uploadedPath;
    }

    await prisma.product.update({
        where: { id },
        data: {
            title,
            description,
            price,
            type,
            imageUrl
        }
    });

    revalidatePath('/admin/products');
    redirect('/admin/products');
}

export async function toggleProductStatus(id: number) {
    const product = await prisma.product.findUnique({ where: { id } });
    await prisma.product.update({
        where: { id },
        data: { isActive: !product?.isActive },
    });
    revalidatePath('/admin/products');
}

export async function deleteProduct(id: number) {
    try {
        await prisma.product.delete({ where: { id } });
        revalidatePath('/admin/products');
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2003') {
            // Foreign key constraint violated
            return { success: false, error: 'Cannot delete product with existing orders. Archive it instead.' };
        }
        return { success: false, error: 'Failed to delete product.' };
    }
}
