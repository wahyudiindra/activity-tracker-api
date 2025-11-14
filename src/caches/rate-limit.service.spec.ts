import { RateLimitService, RateLimitResult } from './rate-limit.service';
import { RedisService } from './redis.service';
import { CacheKey } from 'src/common/constants/cache-key.enum';

const BASE_TIME = 1_700_000_000_000;

describe('RateLimitService', () => {
    let rateLimitService: RateLimitService;
    let redisClientMock: {
        incr: jest.Mock;
        expire: jest.Mock;
        ttl: jest.Mock;
    };
    let redisServiceMock: RedisService;

    beforeEach(() => {
        jest.spyOn(Date, 'now').mockReturnValue(BASE_TIME);
        process.env.RATE_LIMIT_CLIENT_PER_HOUR = '2';
        process.env.RATE_LIMIT_WINDOW_SECONDS = '3600';

        redisClientMock = {
            incr: jest.fn(),
            expire: jest.fn(),
            ttl: jest.fn(),
        };

        redisServiceMock = {
            client: redisClientMock as any,
            isDown: false,
        } as RedisService;

        rateLimitService = new RateLimitService(redisServiceMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete process.env.RATE_LIMIT_CLIENT_PER_HOUR;
        delete process.env.RATE_LIMIT_WINDOW_SECONDS;
    });

    it('allows request and sets expiry on first hit', async () => {
        redisClientMock.incr.mockResolvedValue(1);
        redisClientMock.ttl.mockResolvedValue(3590);

        const result = await rateLimitService.consume('client-1');

        expect(redisClientMock.incr).toHaveBeenCalledWith(`${CacheKey.RATE_LIMIT_CLIENT_PER_HOUR}:client-1`);
        expect(redisClientMock.expire).toHaveBeenCalledWith(
            `${CacheKey.RATE_LIMIT_CLIENT_PER_HOUR}:client-1`,
            3600,
        );
        expect(redisClientMock.ttl).toHaveBeenCalled();

        expect(result).toEqual<RateLimitResult>({
            allowed: true,
            limit: 2,
            current: 1,
            remaining: 1,
            resetAt: BASE_TIME + 3590 * 1000,
            retryAfterSeconds: 3590,
        });
    });

    it('rejects when current count exceeds limit', async () => {
        redisClientMock.incr.mockResolvedValue(3); // limit = 2
        redisClientMock.ttl.mockResolvedValue(5);

        const result = await rateLimitService.consume('client-2');

        expect(result.allowed).toBe(false);
        expect(result.remaining).toBe(0);
        expect(result.retryAfterSeconds).toBe(5);
    });

    it('bypasses limiting when redis is down', async () => {
        redisServiceMock.isDown = true;

        const result = await rateLimitService.consume('client-3');

        expect(redisClientMock.incr).not.toHaveBeenCalled();
        expect(result.allowed).toBe(true);
        expect(result.current).toBe(0);
        expect(result.remaining).toBe(2);
    });

    it('falls back when redis operations throw', async () => {
        redisClientMock.incr.mockRejectedValue(new Error('boom'));

        const result = await rateLimitService.consume('client-4');

        expect(result.allowed).toBe(true);
        expect(result.current).toBe(0);
        expect(result.remaining).toBe(2);
    });
});

