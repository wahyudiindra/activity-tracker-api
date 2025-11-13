import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterClientDto } from './dto/register-client.dto';
import { PrismaService } from 'src/common/prisma.service';
import { randomBytes } from 'crypto';
import { CreateLogDto } from './dto/create-log.dto';

@Injectable()
export class ClientsService {
    constructor(private prisma: PrismaService) {}

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

    createLog(clientId: any, data: CreateLogDto) {
        return this.prisma.apiLog.create({ data: { clientId, ...data } });
    }
}
