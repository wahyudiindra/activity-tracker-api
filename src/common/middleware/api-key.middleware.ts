import { Injectable, NestMiddleware, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { HEADER_API_KEY } from '../constants/default';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
    constructor(private readonly prisma: PrismaService) {}

    async use(req: any, res: any, next: () => void) {
        const apiKey = req.headers[HEADER_API_KEY];

        if (!apiKey) {
            throw new UnauthorizedException('API Key is required');
        }

        const client = await this.prisma.client.findUnique({
            where: { apiKey: String(apiKey) },
            select: { clientId: true, isActive: true },
        });

        if (!client) {
            throw new UnauthorizedException('Invalid API Key');
        } else if (!client.isActive) {
            throw new ForbiddenException('Client is inactive');
        }

        req.clientId = client.clientId;

        next();
    }
}
