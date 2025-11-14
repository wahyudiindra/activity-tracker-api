import { CacheService } from './caches.service';
import { RedisService } from './redis.service';
import { LruCacheService } from './lru-cache.service';
import { CacheKey } from 'src/common/constants/cache-key.enum';
import { REDIS_DEFAULT_TTL } from 'src/common/constants/default';

const BASE_TIME = 1_700_000_000_000;

describe('CacheService', () => {
    let service: CacheService;
    let redisMock: {
        safeGet: jest.Mock;
        safeSet: jest.Mock;
        client: { incr: jest.Mock; expire: jest.Mock };
        isDown: boolean;
    };
    let lruMock: {
        get: jest.Mock;
        set: jest.Mock;
        delete: jest.Mock;
    };

    beforeEach(() => {
        jest.spyOn(Date, 'now').mockReturnValue(BASE_TIME);
        redisMock = {
            safeGet: jest.fn(),
            safeSet: jest.fn(),
            client: { incr: jest.fn(), expire: jest.fn() },
            isDown: false,
        };

        lruMock = {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
        };

        service = new CacheService(redisMock as unknown as RedisService, lruMock as unknown as LruCacheService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns value from Redis when available', async () => {
        redisMock.safeGet.mockResolvedValueOnce('1'); // version
        redisMock.safeGet.mockResolvedValueOnce(JSON.stringify({ hello: 'world' }));

        const fetcher = jest.fn();
        const result = await service.getOrSet('usage:daily', 60, fetcher);

        expect(fetcher).not.toHaveBeenCalled();
        expect(result).toEqual({ hello: 'world' });

        expect(redisMock.safeGet).toHaveBeenNthCalledWith(
            1,
            `${CacheKey.CACHE_VERSION}:usage`,
        );
        expect(redisMock.safeGet).toHaveBeenNthCalledWith(2, 'usage:daily:v1');
    });

    it('returns value from LRU when Redis misses', async () => {
        redisMock.safeGet.mockResolvedValueOnce('1'); // version lookup
        redisMock.safeGet.mockResolvedValueOnce(null);
        lruMock.get.mockReturnValue({ fallback: true });

        const fetcher = jest.fn();
        const result = await service.getOrSet('usage:daily', 60, fetcher);

        expect(fetcher).not.toHaveBeenCalled();
        expect(result).toEqual({ fallback: true });
    });

    it('fetches from DB and writes to Redis when caches miss', async () => {
        redisMock.safeGet.mockResolvedValueOnce('2'); // version key
        redisMock.safeGet.mockResolvedValueOnce(null); // no redis value
        const fetcher = jest.fn().mockResolvedValue({ fromDB: true });

        const result = await service.getOrSet('usage:daily', 120, fetcher);

        expect(fetcher).toHaveBeenCalled();
        expect(redisMock.safeSet).toHaveBeenCalledWith('usage:daily:v2', JSON.stringify({ fromDB: true }), 120);
        expect(lruMock.set).not.toHaveBeenCalled();
        expect(result).toEqual({ fromDB: true });
    });

    it('falls back to LRU write when Redis is down', async () => {
        redisMock.isDown = true;
        const fetcher = jest.fn().mockResolvedValue({ offline: true });

        const result = await service.getOrSet('usage:daily', 30, fetcher);

        expect(lruMock.set).toHaveBeenCalledWith('usage:daily', { offline: true }, 30 * 1000);
        expect(redisMock.safeSet).not.toHaveBeenCalled();
        expect(result).toEqual({ offline: true });
    });

    it('bumps cache version and sets expiry on first increment', async () => {
        redisMock.client.incr.mockResolvedValueOnce(1);

        await service.bumpVersion('usage:daily');

        expect(redisMock.client.incr).toHaveBeenCalledWith(`${CacheKey.CACHE_VERSION}:usage`);
        expect(redisMock.client.expire).toHaveBeenCalledWith(`${CacheKey.CACHE_VERSION}:usage`, REDIS_DEFAULT_TTL);
    });
});
