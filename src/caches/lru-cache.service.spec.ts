import { LruCacheService } from './lru-cache.service';

describe('LruCacheService', () => {
    it('stores, retrieves, and deletes values', () => {
        const cache = new LruCacheService();
        cache.set('key', { foo: 'bar' }, 1000);

        expect(cache.get('key')).toEqual({ foo: 'bar' });

        cache.delete('key');
        expect(cache.get('key')).toBeNull();
    });

    it('returns null for unknown keys', () => {
        const cache = new LruCacheService();
        expect(cache.get('missing')).toBeNull();
    });
});

