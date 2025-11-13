import { Module } from '@nestjs/common';
import { CacheService } from './caches.service';
import { RedisService } from './redis.service';
import { LruCacheService } from './lru-cache.service';

@Module({
    providers: [CacheService, RedisService, LruCacheService],
    exports: [CacheService],
})
export class CachesModule {}
