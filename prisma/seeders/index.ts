import admin from './admin.seeder';
import apiLog from './api-log.seeder';
import client from './client.seeder';
import { Prisma } from './prisma.utils';

async function main() {
    console.log('\n-> START::SEEDING');

    await admin.run(10);
    await client.run(1000);
    await apiLog.run(10);

    console.log('-> FINISH::SEEDING\n');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await Prisma.instance.$disconnect();
    });
