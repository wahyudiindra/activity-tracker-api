import { Module } from '@nestjs/common';
import { CacheService } from './caches.service';
import { RedisService } from './redis.service';
import { LruCacheService } from './lru-cache.service';
import { RateLimitService } from './rate-limit.service';

@Module({
    providers: [CacheService, RedisService, LruCacheService, RateLimitService],
    exports: [CacheService, RateLimitService],
})
export class CachesModule {}
