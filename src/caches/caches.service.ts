import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { LruCacheService } from './lru-cache.service';
import { CacheKey } from 'src/common/constants/cache-key.enum';
import { REDIS_DEFAULT_TTL } from 'src/common/constants/default';

@Injectable()
export class CacheService {
    constructor(
        private readonly redis: RedisService,
        private readonly lru: LruCacheService,
    ) {}

    private getVersionKey(originalKey: string): string {
        const prefix = originalKey.split(':')[0];

        return `${CacheKey.CACHE_VERSION}:${prefix || originalKey}`;
    }

    private async getVersion(originalKey: string): Promise<string> {
        const versionKey = this.getVersionKey(originalKey);

        const value = await this.redis.safeGet(versionKey);
        return value ?? '0';
    }

    async bumpVersion(originalKey: string): Promise<void> {
        if (this.redis.isDown) return;

        const versionKey = this.getVersionKey(originalKey);
        const current = await this.redis.client.incr(versionKey);
        if (current === 1) {
            await this.redis.client.expire(versionKey, REDIS_DEFAULT_TTL);
        }
    }

    private async constructVersionedKey(originalKey: string): Promise<string> {
        const version = await this.getVersion(originalKey);
        return `${originalKey}:v${version}`;
    }

    // Redis (if UP) -> LRU (if Redis DOWN) -> DB fetch (via callback)
    async getOrSet<T>(originalKey: string, ttlSeconds: number, fetchFromDB: () => Promise<T>): Promise<T> {
        const versionedKey = await this.constructVersionedKey(originalKey);
        if (!this.redis.isDown) {
            const redisValue = await this.redis.safeGet(versionedKey);
            if (redisValue) return JSON.parse(redisValue) as T;
        }

        const localValue = this.lru.get<T>(originalKey);
        if (localValue) return localValue;

        const result = await fetchFromDB();
        if (!this.redis.isDown) {
            await this.redis.safeSet(versionedKey, JSON.stringify(result), ttlSeconds);
        } else {
            this.lru.set(originalKey, result, ttlSeconds * 1000);
        }

        return result;
    }

    async invalidate(originalKey: string) {
        await this.bumpVersion(originalKey);
    }
}
