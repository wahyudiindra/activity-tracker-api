import { UsagesService } from './usages.service';
import { PrismaService } from 'src/common/prisma.service';
import { CacheService } from 'src/caches/caches.service';
import { CacheKey } from 'src/common/constants/cache-key.enum';
import { REDIS_DEFAULT_TTL } from 'src/common/constants/default';

describe('UsagesService', () => {
    let service: UsagesService;
    let prisma: jest.Mocked<PrismaService>;
    let cacheService: jest.Mocked<CacheService>;

    beforeEach(() => {
        prisma = {
            $queryRaw: jest.fn(),
        } as unknown as jest.Mocked<PrismaService>;

        cacheService = {
            getOrSet: jest.fn(),
        } as unknown as jest.Mocked<CacheService>;

        service = new UsagesService(prisma, cacheService);
    });

    it('returns daily usage aggregated via cache', async () => {
        const mockData = [
            { date: '2024-01-01', totalRequest: 2 },
            { date: '2024-01-02', totalRequest: 3 },
        ];

        cacheService.getOrSet.mockImplementation(async (_key, _ttl, cb) => cb());
        prisma.$queryRaw.mockResolvedValue(mockData as any);

        const result = await service.getDaily();

        expect(cacheService.getOrSet).toHaveBeenCalledWith(
            CacheKey.USAGE_DAILY,
            REDIS_DEFAULT_TTL,
            expect.any(Function),
        );
        expect(result).toEqual({
            totalRequest: 5,
            data: mockData,
        });
    });

    it('returns top usage stats via cache', async () => {
        const mockData = [
            { clientId: 'c1', totalRequest: 10 },
            { clientId: 'c2', totalRequest: 4 },
        ];

        cacheService.getOrSet.mockImplementation(async (_key, _ttl, cb) => cb());
        prisma.$queryRaw.mockResolvedValue(mockData as any);

        const result = await service.getTop3();

        expect(cacheService.getOrSet).toHaveBeenCalledWith(
            CacheKey.USAGE_TOP,
            REDIS_DEFAULT_TTL,
            expect.any(Function),
        );
        expect(result).toEqual({
            totalRequest: 14,
            data: mockData,
        });
    });
});

