'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { uploadFile } from '@/lib/upload';

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

    const startDescription = formData.get('start_description') as string;
    await prisma.settings.upsert({
        where: { key: 'start_description' },
        update: { value: startDescription },
        create: { key: 'start_description', value: startDescription },
    });

    // Sync to Telegram immediately
    if (process.env.TELEGRAM_BOT_TOKEN) {
        try {
            // Manual fetch to avoid importing the whole bot instance which might cause side effects
            const token = process.env.TELEGRAM_BOT_TOKEN;
            const url = `https://api.telegram.org/bot${token}/setMyDescription`;
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: startDescription })
            });
        } catch (e) {
            console.error("Failed to sync description to Telegram API:", e);
        }
    }

    const welcomeMessage = formData.get('welcome_message') as string;
    await prisma.settings.upsert({
        where: { key: 'welcome_message' },
        update: { value: welcomeMessage },
        create: { key: 'welcome_message', value: welcomeMessage },
    });

    const activationInfo = formData.get('activation_info') as string;
    await prisma.settings.upsert({
        where: { key: 'activation_info' },
        update: { value: activationInfo },
        create: { key: 'activation_info', value: activationInfo },
    });

    const rulesUrl = formData.get('rules_url') as string;
    await prisma.settings.upsert({
        where: { key: 'rules_url' },
        update: { value: rulesUrl },
        create: { key: 'rules_url', value: rulesUrl },
    });

    const rulesText = formData.get('rules_text') as string;
    await prisma.settings.upsert({
        where: { key: 'rules_text' },
        update: { value: rulesText },
        create: { key: 'rules_text', value: rulesText },
    });

    const supportUrl = formData.get('support_url') as string;
    await prisma.settings.upsert({
        where: { key: 'support_url' },
        update: { value: supportUrl },
        create: { key: 'support_url', value: supportUrl },
    });

    const welcomeImage = formData.get('welcome_image') as File;
    if (welcomeImage && welcomeImage.size > 0) {
        const imagePath = await uploadFile(welcomeImage, 'settings');
        if (imagePath) {
            await prisma.settings.upsert({
                where: { key: 'welcome_image' },
                update: { value: imagePath },
                create: { key: 'welcome_image', value: imagePath },
            });
        }
    }

    const activationImage = formData.get('activation_image') as File;
    if (activationImage && activationImage.size > 0) {
        const imagePath = await uploadFile(activationImage, 'settings');
        if (imagePath) {
            await prisma.settings.upsert({
                where: { key: 'activation_image' },
                update: { value: imagePath },
                create: { key: 'activation_image', value: imagePath },
            });
        }
    }

    revalidatePath('/admin/settings');
    revalidatePath('/rules');
}
