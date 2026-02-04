import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Globe, Bot } from 'lucide-react';

import { Search } from './search';
import { DateFilter } from '../components/date-filter';
import { ManualRevenueControl } from './manual-revenue';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { TokenModal } from './token-modal';

type OrderWithRelations = {
    id: number;
    amount: number;
    status: string;
    createdAt: Date;
    source: string;
    sessionToken: string | null;
    product: {
        title: string;
    };
    isRevenueSent: boolean;
    sentRevenueAmount: number | null;
    user: {
        username: string | null;
        firstName: string | null;
        lastName: string | null;
        yandexClientId: string | null;
        email: string | null;
        telegramId: string | null;
    };
};


export const dynamic = 'force-dynamic';

export default async function OrdersPage(props: {
    searchParams: Promise<{
        q?: string;
        date?: string;
        page?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || undefined;
    const dateFilter = searchParams?.date || undefined;

    let whereClause: any = {};

    if (query) {
        // Check if query is a number (Order ID)
        const numQuery = parseInt(query);
        if (!isNaN(numQuery)) {
            // Check if it matches our Public ID format (offset 27654423) or internal ID
            // User likely searching for Public ID shown in bot
            const OFFSET = 27654423;
            if (numQuery > OFFSET) {
                whereClause = { id: numQuery - OFFSET };
            } else {
                // Fallback: exact match internal ID OR simple user search if intended?
                // Let's assume loose search if not strict public ID format, but user asked for "by order number".
                // If they type "1", do they mean internal ID 1? Probably not if they only see Public IDs.
                // But let's verify.
                // For now, strict search on Public ID if number is large.
                // If small number, maybe they are debugging.
                whereClause = { id: numQuery };
            }
        } else {
            // Search by username if text
            // Strip @ if present for better matching (Telegram usernames stored without @)
            const cleanQuery = query.replace('@', '');

            whereClause = {
                user: {
                    username: {
                        contains: cleanQuery,
                    }
                }
            };
        }
    }

    if (dateFilter) {
        const start = new Date(dateFilter);
        start.setHours(0, 0, 0, 0);

        const end = new Date(dateFilter);
        end.setHours(23, 59, 59, 999);

        // Merge with existing whereClause if needed (though search usually overrides or combines?)
        // Currently search logic sets whereClause = ... replacing it. 
        // We need to merge them.
        whereClause = {
            ...whereClause,
            createdAt: {
                gte: start,
                lte: end
            }
        };
    }

    const page = Number((await props.searchParams).page) || 1;
    const PAGE_SIZE = 50;
    const skip = (page - 1) * PAGE_SIZE;

    const [orders, totalCount] = await Promise.all([
        prisma.order.findMany({
            where: whereClause,
            include: {
                user: true,
                product: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: PAGE_SIZE,
            skip: skip,
        }) as unknown as Promise<OrderWithRelations[]>,
        prisma.order.count({ where: whereClause })
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Заказы</h1>

            <div className="flex items-center space-x-2">
                <Search placeholder="Поиск по номеру заказа..." />
                <DateFilter />
            </div>

            <div className="rounded-md border bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">История заказов</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Src</TableHead>
                            <TableHead>Пользователь</TableHead>
                            <TableHead>Товар</TableHead>
                            <TableHead>Сумма</TableHead>
                            <TableHead>Token</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Дата</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order: OrderWithRelations) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">
                                    {/* Display Public ID */}
                                    {27654423 + order.id}
                                </TableCell>
                                <TableCell>
                                    {order.source === 'WEB' ? (
                                        <span title="Сайт"><Globe className="w-5 h-5 text-blue-500" /></span>
                                    ) : (
                                        <span title="Бот"><Bot className="w-5 h-5 text-purple-500" /></span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {order.user.firstName} {order.user.lastName} <br />
                                    {order.user.username && <span className="text-xs text-muted-foreground mr-2">@{order.user.username}</span>}
                                    {order.user.email && <span className="text-xs text-blue-600 block">{order.user.email}</span>}
                                </TableCell>
                                <TableCell>{order.product.title}</TableCell>
                                <TableCell>{order.amount} ₽</TableCell>
                                <TableCell>
                                    <TokenModal token={order.sessionToken} />
                                </TableCell>
                                <TableCell>
                                    <ManualRevenueControl
                                        orderId={order.id}
                                        initialIsSent={order.isRevenueSent}
                                        initialAmount={order.sentRevenueAmount}
                                        hasClientId={!!(order.user.yandexClientId || order.user.telegramId)}
                                    />
                                </TableCell>
                                <TableCell>
                                    {order.status === 'PAID' && <Badge className="bg-green-600">Оплачен</Badge>}
                                    {order.status === 'PENDING' && <Badge variant="outline">Ожидает</Badge>}
                                    {order.status === 'COMPLETED' && <Badge variant="secondary">Выдан</Badge>}
                                    {order.status === 'CANCELED' && <Badge variant="destructive">Не оплачен</Badge>}
                                </TableCell>
                                <TableCell>
                                    {new Date(order.createdAt).toLocaleString('ru-RU', {
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

                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                                    Заказов пока нет.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <PaginationControls totalCount={totalCount} pageSize={PAGE_SIZE} />
            </div>
        </div>
    );
}
