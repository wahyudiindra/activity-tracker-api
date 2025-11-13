import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterClientDto } from './dto/register-client.dto';
import { PrismaService } from 'src/common/prisma.service';
import { randomBytes } from 'crypto';

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
}
