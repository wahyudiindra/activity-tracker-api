import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ApiKeyMiddleware } from './api-key.middleware';
import { PrismaService } from '../prisma.service';
import { HEADER_API_KEY } from '../constants/default';

type PrismaMiddlewareMock = {
    client: {
        findUnique: jest.Mock;
    };
};

describe('ApiKeyMiddleware', () => {
    let middleware: ApiKeyMiddleware;
    let prismaMock: PrismaMiddlewareMock;
    const next = jest.fn();

    beforeEach(() => {
        prismaMock = {
            client: {
                findUnique: jest.fn(),
            },
        };
        middleware = new ApiKeyMiddleware(prismaMock as unknown as PrismaService);
        next.mockReset();
    });

    it('throws when header missing', async () => {
        const req: any = { headers: {} };
        await expect(middleware.use(req, null, next)).rejects.toThrow(UnauthorizedException);
    });

    it('throws when client not found', async () => {
        const req: any = { headers: { [HEADER_API_KEY]: 'api-123' } };
        prismaMock.client.findUnique.mockResolvedValue(null);

        await expect(middleware.use(req, null, next)).rejects.toThrow(UnauthorizedException);
    });

    it('throws when client inactive', async () => {
        const req: any = { headers: { [HEADER_API_KEY]: 'api-123' } };
        prismaMock.client.findUnique.mockResolvedValue({ clientId: 'c1', isActive: false });

        await expect(middleware.use(req, null, next)).rejects.toThrow(ForbiddenException);
    });

    it('attaches clientId and calls next when valid', async () => {
        const req: any = { headers: { [HEADER_API_KEY]: 'api-123' } };
        prismaMock.client.findUnique.mockResolvedValue({ clientId: 'c1', isActive: true });

        await middleware.use(req, null, next);

        expect(req.clientId).toBe('c1');
        expect(next).toHaveBeenCalled();
    });
});
