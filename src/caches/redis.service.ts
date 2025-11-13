import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    private readonly logger = new Logger(RedisService.name);

    public client: Redis;
    public isDown = false;

    constructor() {
        this.client = new Redis(Number(process.env.REDIS_PORT), String(process.env.REDIS_HOST));

        this.client.on('connect', () => {
            this.logger.log('Redis connected');
            this.isDown = false;
        });

        this.client.on('error', (err) => {
            this.logger.error(`Redis error: ${err.message}`);
            this.isDown = true;
        });

        this.client.on('end', () => {
            this.logger.warn('Redis connection closed');
            this.isDown = true;
        });
    }

    async safeGet(key: string): Promise<string | null> {
        if (this.isDown) return null;

        try {
            return await this.client.get(key);
        } catch (e) {
            this.isDown = true;
            return null;
        }
    }

    async safeSet(key: string, value: string, ttlSeconds: number) {
        if (this.isDown) return;

        try {
            await this.client.set(key, value, 'EX', ttlSeconds);
        } catch (e) {
            this.isDown = true;
        }
    }
}
