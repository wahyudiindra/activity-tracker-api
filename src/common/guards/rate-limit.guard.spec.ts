import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { RateLimitGuard } from './rate-limit.guard';
import { RateLimitService } from 'src/caches/rate-limit.service';

describe('RateLimitGuard', () => {
    let guard: RateLimitGuard;
    let rateLimitService: jest.Mocked<RateLimitService>;
    let context: ExecutionContext;
    const request: any = {};

    beforeEach(() => {
        rateLimitService = {
            consume: jest.fn(),
        } as unknown as jest.Mocked<RateLimitService>;

        guard = new RateLimitGuard(rateLimitService);
        context = {
            switchToHttp: () => ({
                getRequest: () => request,
            }),
        } as ExecutionContext;
    });

    it('allows when clientId missing', async () => {
        request.clientId = undefined;
        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        expect(rateLimitService.consume).not.toHaveBeenCalled();
    });

    it('allows when rate limit passes', async () => {
        request.clientId = 'client-1';
        rateLimitService.consume.mockResolvedValue({
            allowed: true,
            limit: 10,
            current: 1,
            remaining: 9,
            resetAt: Date.now(),
            retryAfterSeconds: 10,
        });

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        expect(request.rateLimit.allowed).toBe(true);
    });

    it('throws when rate limit exceeded', async () => {
        request.clientId = 'client-2';
        rateLimitService.consume.mockResolvedValue({
            allowed: false,
            limit: 1,
            current: 2,
            remaining: 0,
            resetAt: Date.now(),
            retryAfterSeconds: 30,
        });

        await expect(guard.canActivate(context)).rejects.toMatchObject({
            status: HttpStatus.TOO_MANY_REQUESTS,
            message: expect.stringContaining('Rate limit exceeded'),
        });
    });
});
