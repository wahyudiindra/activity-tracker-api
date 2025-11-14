import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CacheKey } from 'src/common/constants/cache-key.enum';

export type RateLimitResult = {
    allowed: boolean;
    limit: number;
    current: number;
    remaining: number;
    resetAt: number;
    retryAfterSeconds: number;
};

@Injectable()
export class RateLimitService {
    private readonly logger = new Logger(RateLimitService.name);

    constructor(private readonly redis: RedisService) {}

    async consume(clientId: string): Promise<RateLimitResult> {
        const limit = Number(process.env.RATE_LIMIT_CLIENT_PER_HOUR) || 25;
        const windowSeconds = Number(process.env.RATE_LIMIT_WINDOW_SECONDS) || 60 * 60;
        if (limit <= 0 || windowSeconds <= 0 || this.redis.isDown) {
            return this.buildBypassResult(limit, 0, windowSeconds);
        }

        const key = `${CacheKey.RATE_LIMIT_CLIENT_PER_HOUR}:${clientId}`;
        try {
            const current = await this.redis.client.incr(key);
            if (current === 1) {
                await this.redis.client.expire(key, windowSeconds);
            }

            const ttl = await this.redis.client.ttl(key);
            const resetSeconds = ttl > 0 ? ttl : windowSeconds;

            return {
                allowed: current <= limit,
                limit,
                current,
                remaining: Math.max(limit - current, 0),
                resetAt: Date.now() + resetSeconds * 1000,
                retryAfterSeconds: Math.max(resetSeconds, 0),
            };
        } catch (error) {
            this.logger.warn(`Rate limit fallback (Redis issue): ${error?.message ?? error}`);
            return this.buildBypassResult(limit, 0, windowSeconds);
        }
    }

    private buildBypassResult(limit: number, current: number, windowSeconds: number): RateLimitResult {
        const retryAfterSeconds = windowSeconds;
        return {
            allowed: true,
            limit,
            current,
            remaining: Math.max(limit - current, 0),
            resetAt: Date.now() + retryAfterSeconds * 1000,
            retryAfterSeconds,
        };
    }
}
