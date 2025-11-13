import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterClientDto } from './dto/register-client.dto';
import { PrismaService } from 'src/common/prisma.service';
import { randomBytes } from 'crypto';
import { CreateLogDto } from './dto/create-log.dto';
import { CacheService } from 'src/caches/caches.service';
import { CacheKey } from 'src/common/constants/cache-key.enum';

@Injectable()
export class ClientsService {
    constructor(
        private prisma: PrismaService,
        private cacheService: CacheService,
    ) {}

    async register(data: RegisterClientDto) {
        const isDuplicate = await this.prisma.client.count({
            where: { OR: [{ clientId: data.clientId }, { email: data.email }] },
        });

        if (isDuplicate) {
            throw new BadRequestException('Email or clientId already registered');
        }

        return this.prisma.client.create({
            data: { ...data, apiKey: `api-${randomBytes(32).toString('hex')}` },
        });
    }

    async createLog(clientId: any, data: CreateLogDto) {
        const log = await this.prisma.apiLog.create({ data: { clientId, ...data } });

        await this.cacheService.invalidate(CacheKey.DAILY_USAGE_RESPONSE);
        return log;
    }
}
