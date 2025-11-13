import { Prisma } from './prisma.utils';
import { Prisma as PrismaClient } from '@prisma/client';
import { fakerID_ID } from '@faker-js/faker';

export const run = async (total: number) => {
    const data: PrismaClient.ClientCreateManyInput[] = [];

    for (let i = 0; i < total; i++) {
        const name = fakerID_ID.person.fullName();
        data.push({
            name,
            email: fakerID_ID.internet.email({ firstName: name }),
            clientId: fakerID_ID.string.uuid(),
            apiKey: fakerID_ID.string.hexadecimal({ length: 64 }).replace('0x', ''),
        });
    }

    await Prisma.instance.client.createMany({ data, skipDuplicates: true });

    console.log('   └─ Completed: clients.');
};
export default {
    run,
};
