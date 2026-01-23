import { prisma } from '@/lib/prisma';
import { BotLink } from '@/components/landing/BotLink';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PaymentSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const invId = resolvedParams['InvId'];

    if (!invId || Array.isArray(invId)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка</h1>
                    <p>Неверный номер заказа.</p>
                    <Link href="/" className="text-blue-600 underline mt-4 block">На главную</Link>
                </div>
            </div>
        );
    }

    const publicOrderId = parseInt(invId, 10);
    const ORDER_ID_OFFSET = 27654423;
    const internalId = publicOrderId - ORDER_ID_OFFSET;

    const order = await prisma.order.findUnique({
        where: { id: internalId },
        include: { product: true }
    });

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold mb-4">Заказ не найден</h1>
                    <p>Возможно, оплата еще обрабатывается.</p>
                    <Link href="/" className="text-blue-600 underline mt-4 block">На главную</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold mb-2">Оплата прошла успешно!</h1>
                <div className="text-gray-600 mb-6 space-y-1">
                    <p>Заказ <span className="font-semibold text-gray-900">#{publicOrderId}</span> оплачен.</p>
                    <p>Товар: <span className="font-semibold text-gray-900">{order.product.title}</span></p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl mb-6 text-sm text-blue-800">
                    <p className="mb-2 font-medium">Свяжитесь с менеджером для получения товара, отправив номер заказа.</p>
                    <div className="flex flex-col gap-1 items-center">
                        <a href="https://t.me/manager_gptsub" target="_blank" className="font-bold text-lg hover:underline block">
                            Telegram: manager_gptsub
                        </a>
                        <a href="mailto:manager.gptsub@gmail.com" className="font-bold text-lg hover:underline block">
                            Email: manager.gptsub@gmail.com
                        </a>
                    </div>
                </div>

                <Link href="/" className="text-gray-500 text-sm hover:underline">
                    Вернуться на главную
                </Link>
            </div>
        </div>
    );
}
