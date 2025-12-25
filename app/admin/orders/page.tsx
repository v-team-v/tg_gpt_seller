import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Search } from './search';

type OrderWithRelations = {
    id: number;
    amount: number;
    status: string;
    createdAt: Date;
    user: {
        username: string | null;
        firstName: string | null;
        lastName: string | null;
    };
    product: {
        title: string;
    };
};


export const dynamic = 'force-dynamic';

export default async function OrdersPage(props: {
    searchParams: Promise<{
        q?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || '';

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

    const orders = await prisma.order.findMany({
        where: whereClause,
        include: {
            user: true,
            product: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    }) as unknown as OrderWithRelations[];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Заказы</h1>

            <div className="flex items-center space-x-2">
                <Search placeholder="Поиск по номеру заказа..." />
            </div>

            <div className="rounded-md border bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">История заказов</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Пользователь</TableHead>
                            <TableHead>Товар</TableHead>
                            <TableHead>Сумма</TableHead>
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
                                    {order.user.firstName} {order.user.lastName} <br />
                                    <span className="text-xs text-muted-foreground">@{order.user.username}</span>
                                </TableCell>
                                <TableCell>{order.product.title}</TableCell>
                                <TableCell>{order.amount} ₽</TableCell>
                                <TableCell>
                                    {order.status === 'PAID' && <Badge className="bg-green-600">Оплачен</Badge>}
                                    {order.status === 'PENDING' && <Badge variant="outline">Ожидает</Badge>}
                                    {order.status === 'COMPLETED' && <Badge variant="secondary">Выдан</Badge>}
                                    {order.status === 'CANCELED' && <Badge variant="destructive">Не оплачен</Badge>}
                                </TableCell>
                                <TableCell>{format(order.createdAt, 'dd.MM.yyyy HH:mm')}</TableCell>
                            </TableRow>
                        ))}

                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                    Заказов пока нет.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
