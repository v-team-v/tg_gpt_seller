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
import { Search } from '../orders/search'; // Reusing from orders
import Link from 'next/link';

import { DateFilter } from '../components/date-filter';

export const dynamic = 'force-dynamic';

export default async function UsersPage(props: {
    searchParams?: Promise<{
        q?: string;
        source?: string;
        date?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || '';
    const sourceFilter = searchParams?.source || '';
    const dateFilter = searchParams?.date || undefined;

    // Build where clause
    const where: any = {};

    if (query) {
        where.OR = [
            { username: { contains: query } },
            { firstName: { contains: query } },
            { telegramId: { contains: query } },
            { email: { contains: query } },
        ];
    }

    if (sourceFilter) {
        where.source = { contains: sourceFilter };
    }
    // ... (lines 46-57 unchanged)

    const users = await prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { orders: true }
            }
        },
        take: 100,
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Пользователи</h1>
            </div>

            <div className="flex gap-4 items-center flex-wrap">
                <Search placeholder="Поиск по ID, user, email..." />
                <Search placeholder="Фильтр по платформе..." queryKey="source" />
                <DateFilter />

                {/* Clear Filters */}
                {(query || sourceFilter || dateFilter) && (
                    <Link href="/admin/users">
                        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                            Сбросить
                        </Badge>
                    </Link>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Список пользователей</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Username / Email</TableHead>
                                <TableHead>Имя</TableHead>
                                <TableHead>Платформа</TableHead>
                                <TableHead>Источник (Client ID)</TableHead>
                                <TableHead>Заказов</TableHead>
                                <TableHead>Дата регистрации</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-mono text-xs">{user.telegramId || '-'}</TableCell>
                                    <TableCell>
                                        {user.username ? (
                                            <a href={`https://t.me/${user.username}`} target="_blank" className="text-blue-600 hover:underline">
                                                @{user.username}
                                            </a>
                                        ) : user.email ? (
                                            <span className="text-xs font-mono">{user.email}</span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                                    <TableCell>
                                        {user.source ? (
                                            <Badge variant={user.source === 'WEB' ? 'default' : 'secondary'}>
                                                {user.source}
                                            </Badge>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Не указан</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {user.yandexClientId || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {user._count.orders > 0 ? (
                                            <Badge variant="outline">{user._count.orders}</Badge>
                                        ) : (
                                            <span className="text-gray-400">0</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-sm">
                                        {new Date(user.createdAt).toLocaleString('ru-RU', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            timeZone: 'Europe/Moscow'
                                        })}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        Пользователи не найдены
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
