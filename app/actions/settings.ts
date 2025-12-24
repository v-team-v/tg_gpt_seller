'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateSettings(formData: FormData) {
    const manualMode = formData.get('manual_mode') === 'on';
    const offlineMessage = formData.get('offline_message') as string;

    // Upsert 'manual_mode'
    await prisma.settings.upsert({
        where: { key: 'manual_mode' },
        update: { value: manualMode ? 'true' : 'false' },
        create: { key: 'manual_mode', value: manualMode ? 'true' : 'false' },
    });

    // Upsert 'offline_message'
    await prisma.settings.upsert({
        where: { key: 'offline_message' },
        update: { value: offlineMessage },
        create: { key: 'offline_message', value: offlineMessage },
    });

    revalidatePath('/admin/settings');
}
