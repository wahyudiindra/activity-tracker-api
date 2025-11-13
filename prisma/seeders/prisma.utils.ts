import { PrismaClient } from '@prisma/client';

export const Prisma = {
    instance: new PrismaClient(),
};

export type IPrisma = typeof Prisma;

Object.freeze(Prisma);
