import { faker } from '@faker-js/faker';
import { Prisma } from './prisma.utils';
import { Prisma as PrismaClient } from '@prisma/client';

export const run = async (total: number) => {
    const endpoints = ['/api/register', '/api/logs', '/api/usage/daily', '/api/usage/top'];
    const clients: { clientId }[] = await Prisma.instance.$queryRaw`
        SELECT client_id as "clientId" FROM "clients"
        ORDER BY random()
        LIMIT ${total}`;

    const data: PrismaClient.ApiLogCreateManyInput[] = [];
    clients.forEach(({ clientId }) => {
        for (let i = 0; i < faker.number.int({ min: 1, max: 100 }); i++) {
            data.push({
                clientId,
                ip: faker.internet.ip(),
                endpoint: faker.helpers.arrayElement(endpoints),
                timestamp: faker.date.past(),
            });
        }
    });

    await Prisma.instance.apiLog.createMany({ data, skipDuplicates: true });

    console.log('   └─ Completed: api logs (random clients).');
};
export default {
    run,
};
