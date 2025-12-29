
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking recent users...');
    const users = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });
    console.log(users);

    console.log('Checking recent orders...');
    const orders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    });
    console.log(orders);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
