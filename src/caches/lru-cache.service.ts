import { Injectable } from '@nestjs/common';
import { LRUCache } from 'lru-cache';

@Injectable()
export class LruCacheService {
    private cache: LRUCache<string, any>;

    constructor() {
        this.cache = new LRUCache<string, any>({
            max: 200, // max 200 keys
            ttl: 1000 * 60 * 60, // 5 minutes (configurable)
        });
    }

    get<T>(key: string): T | null {
        return this.cache.get(key) ?? null;
    }

    set(key: string, value: any, ttlMs?: number) {
        this.cache.set(key, value, { ttl: ttlMs });
    }

    delete(key: string) {
        this.cache.delete(key);
    }
}
