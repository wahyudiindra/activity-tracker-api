import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { LruCacheService } from './lru-cache.service';

@Injectable()
export class CacheService {
    constructor(
        private readonly redis: RedisService,
        private readonly lru: LruCacheService,
    ) {}

    // Redis (if UP) -> LRU (if Redis DOWN) -> DB fetch (via callback)
    async getOrSet<T>(key: string, ttlSeconds: number, fetchFromDB: () => Promise<T>): Promise<T> {
        if (!this.redis.isDown) {
            const redisValue = await this.redis.safeGet(key);
            if (redisValue) return JSON.parse(redisValue) as T;
        }

        const localValue = this.lru.get<T>(key);
        if (localValue) return localValue;

        const result = await fetchFromDB();
        if (!this.redis.isDown) {
            await this.redis.safeSet(key, JSON.stringify(result), ttlSeconds);
        } else {
            this.lru.set(key, result, ttlSeconds * 1000);
        }

        return result;
    }

    async invalidate(key: string) {
        this.lru.delete(key);

        if (!this.redis.isDown) await this.redis.client.del(key);
    }
}
