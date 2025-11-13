import { Prisma } from './prisma.utils';
import { Prisma as PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { fakerID_ID } from '@faker-js/faker';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_PASSWORD } from '../../src/common/constants/default';

export const run = async (total: number) => {
    const encryptedPass = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const data: PrismaClient.AdminCreateManyInput[] = [{ email: DEFAULT_ADMIN_EMAIL, password: encryptedPass }];

    for (let i = 0; i < total; i++) {
        data.push({ email: fakerID_ID.internet.email(), password: encryptedPass });
    }

    await Prisma.instance.admin.createMany({ data, skipDuplicates: true });

    console.log('   └─ Completed: admins.');
};
export default {
    run,
};
