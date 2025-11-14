import { BadRequestException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { PrismaService } from 'src/common/prisma.service';
import { CacheService } from 'src/caches/caches.service';
import { CacheKey } from 'src/common/constants/cache-key.enum';

jest.mock('crypto', () => ({
    randomBytes: jest.fn(() => Buffer.from('a'.repeat(64), 'hex')),
}));

type PrismaMock = {
    client: {
        count: jest.Mock;
        create: jest.Mock;
    };
    apiLog: {
        create: jest.Mock;
    };
};

type CacheServiceMock = {
    invalidate: jest.Mock;
};

describe('ClientsService', () => {
    let service: ClientsService;
    let prismaMock: PrismaMock;
    let cacheMock: CacheServiceMock;

    beforeEach(() => {
        prismaMock = {
            client: {
                count: jest.fn(),
                create: jest.fn(),
            },
            apiLog: {
                create: jest.fn(),
            },
        };

        cacheMock = {
            invalidate: jest.fn(),
        };

        service = new ClientsService(prismaMock as unknown as PrismaService, cacheMock as unknown as CacheService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('throws when registering duplicate client id/email', async () => {
        prismaMock.client.count.mockResolvedValue(1);

        await expect(
            service.register({ clientId: 'c1', email: 'a@b.com', name: 'A' }),
        ).rejects.toThrow(BadRequestException);
        expect(prismaMock.client.create).not.toHaveBeenCalled();
    });

    it('creates a new client with generated api key', async () => {
        prismaMock.client.count.mockResolvedValue(0);
        prismaMock.client.create.mockResolvedValue({
            clientId: 'c1',
            email: 'a@b.com',
            apiKey: 'api-dummy',
        } as any);

        const result = await service.register({ clientId: 'c1', email: 'a@b.com', name: 'A' });

        expect(prismaMock.client.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                apiKey: expect.stringMatching(/^api-/),
            }),
        });
        expect(result).toEqual(expect.objectContaining({ apiKey: 'api-dummy' }));
    });

    it('creates log entry and invalidates cache', async () => {
        prismaMock.apiLog.create.mockResolvedValue({ id: '1' } as any);

        const log = await service.createLog('client-1', { endpoint: '/foo', ip: '1.1.1.1' });

        expect(prismaMock.apiLog.create).toHaveBeenCalledWith({
            data: { clientId: 'client-1', endpoint: '/foo', ip: '1.1.1.1' },
        });
        expect(cacheMock.invalidate).toHaveBeenCalledWith(CacheKey.USAGE_DAILY.split(':')[0]);
        expect(log).toEqual({ id: '1' });
    });
});
