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

export const dynamic = 'force-dynamic';

export default async function UsersPage(props: {
    searchParams?: Promise<{
        q?: string;
        source?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || '';
    const sourceFilter = searchParams?.source || '';

    // Build where clause
    const where: any = {};

    if (query) {
        where.OR = [
            { username: { contains: query } }, // Case sensitive in SQLite usually, but prisma might handle? we'll see
            { firstName: { contains: query } },
            { telegramId: { contains: query } },
        ];
    }

    if (sourceFilter) {
        where.source = sourceFilter;
    }

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

    // Fetch distinct sources for filter
    // Prisma doesn't support distinct select easily with findMany typesafe sometimes, 
    // but we can group by.
    const sourcesGroup = await prisma.user.groupBy({
        by: ['source'],
        _count: {
            source: true
        },
        where: {
            source: { not: null }
        }
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Пользователи</h1>
            </div>

            <div className="flex gap-4 items-center">
                <Search placeholder="Поиск по ID, имени, username..." />

                {/* Simple Source Filter Link Generator */}
                <div className="flex gap-2">
                    <Link href="/admin/users">
                        <Badge variant={!sourceFilter ? "default" : "outline"} className="cursor-pointer">
                            Все
                        </Badge>
                    </Link>
                    {sourcesGroup.map((s) => (
                        s.source && (
                            <Link key={s.source} href={`/admin/users?source=${s.source}`}>
                                <Badge variant={sourceFilter === s.source ? "default" : "outline"} className="cursor-pointer">
                                    {s.source} ({s._count.source})
                                </Badge>
                            </Link>
                        )
                    ))}
                </div>
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
                                <TableHead>Username</TableHead>
                                <TableHead>Имя</TableHead>
                                <TableHead>Источник</TableHead>
                                <TableHead>Заказов</TableHead>
                                <TableHead>Дата регистрации</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-mono text-xs">{user.telegramId}</TableCell>
                                    <TableCell>
                                        {user.username ? (
                                            <a href={`https://t.me/${user.username}`} target="_blank" className="text-blue-600 hover:underline">
                                                @{user.username}
                                            </a>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                                    <TableCell>
                                        {user.source ? (
                                            <Badge variant="secondary">{user.source}</Badge>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Не указан</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {user._count.orders > 0 ? (
                                            <Badge variant="outline">{user._count.orders}</Badge>
                                        ) : (
                                            <span className="text-gray-400">0</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-sm">
                                        {new Date(user.createdAt).toLocaleDateString('ru-RU')}
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
