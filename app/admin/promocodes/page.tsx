import { prisma } from '@/lib/prisma';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from '../orders/search'; // Reusing search component
// Using a separate client component for creation form and delete buttons to keep page server-rendered
import { CreatePromoForm } from './create-form';
import { DeletePromoButton } from './delete-button';
import { EditComment } from './edit-comment';

export const dynamic = 'force-dynamic';

export default async function PromoCodesPage(props: {
    searchParams?: Promise<{
        q?: string;
        status?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || '';
    const statusFilter = searchParams?.status || 'all'; // all, free, active, used

    // Build where clause
    const where: any = {};

    if (query) {
        where.OR = [
            { code: { contains: query } },
            { comment: { contains: query } },
        ];
    }

    if (statusFilter === 'free') {
        where.isUsed = false;
        where.activatedByUserId = null;
    } else if (statusFilter === 'active') {
        where.isUsed = false;
        where.activatedByUserId = { not: null };
    } else if (statusFilter === 'used') {
        where.isUsed = true;
    }

    const promoCodes = await prisma.promoCode.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            activatedBy: true,
            usedBy: true,
        },
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Промокоды</h1>
            </div>

            <CreatePromoForm />

            <div className="flex gap-4 items-center flex-wrap">
                <Search placeholder="Поиск по коду или комментарию..." />

                {/* Simple status filter links for now, or could be a Select component */}
                <div className="flex gap-2 text-sm bg-slate-100 p-1 rounded-lg">
                    <FilterLink current={statusFilter} value="all" label="Все" />
                    <FilterLink current={statusFilter} value="free" label="Свободные" />
                    <FilterLink current={statusFilter} value="active" label="Активированные" />
                    <FilterLink current={statusFilter} value="used" label="Использованные" />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Список промокодов</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Код</TableHead>
                                <TableHead>Сумма</TableHead>
                                <TableHead>Комментарий</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Дата создания</TableHead>
                                <TableHead>Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {promoCodes.map((promo) => (
                                <TableRow key={promo.id}>
                                    <TableCell className="font-mono text-sm font-bold">
                                        {promo.code}
                                    </TableCell>
                                    <TableCell>{promo.discountAmount} ₽</TableCell>
                                    <TableCell>
                                        <EditComment id={promo.id} initialComment={promo.comment || ''} />
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge promo={promo} />
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-sm">
                                        {new Date(promo.createdAt).toLocaleString('ru-RU', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            timeZone: 'Europe/Moscow'
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <DeletePromoButton id={promo.id} />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {promoCodes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        Промокоды не найдены
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function FilterLink({ current, value, label }: { current: string, value: string, label: string }) {
    const isActive = current === value;
    return (
        <a
            href={`/admin/promocodes?status=${value}`}
            className={`px-3 py-1 rounded-md transition-colors ${isActive ? 'bg-white shadow-sm font-medium text-black' : 'text-gray-500 hover:text-black'}`}
        >
            {label}
        </a>
    );
}

function StatusBadge({ promo }: { promo: any }) {
    if (promo.isUsed) {
        return (
            <div className="flex flex-col gap-1">
                <Badge variant="secondary" className="bg-gray-200 text-gray-700 w-fit">Использован</Badge>
                {promo.usedBy && <span className="text-xs text-gray-500">@{promo.usedBy.username || promo.usedBy.telegramId}</span>}
            </div>
        );
    }
    if (promo.activatedBy) {
        return (
            <div className="flex flex-col gap-1">
                <Badge variant="outline" className="border-blue-500 text-blue-600 w-fit">Активирован</Badge>
                <span className="text-xs text-gray-500">@{promo.activatedBy.username || promo.activatedBy.telegramId}</span>
            </div>
        );
    }
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Свободен</Badge>;
}
