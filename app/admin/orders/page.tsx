import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Order, User, Product } from '@prisma/client';

type OrderWithRelations = Order & { user: User; product: Product };


export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            product: true,
            user: true,
        }
    });

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Заказы</h2>

            <Card>
                <CardHeader>
                    <CardTitle>История заказов</CardTitle>
                </CardHeader>
                <CardContent>
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
                                    <TableCell className="font-medium">#{order.id}</TableCell>
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
                </CardContent>
            </Card>
        </div>
    );
}
