import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
    private readonly logger = new Logger(RedisService.name);

    public client: Redis;
    public isDown = false;

    constructor() {
        this.client = new Redis({
            port: Number(process.env.REDIS_PORT),
            host: String(process.env.REDIS_HOST),
            retryStrategy(times) {
                return Math.min(times * 200, 1000 * 2);
            },
            maxRetriesPerRequest: 0,
            connectTimeout: 2000,
            enableReadyCheck: true,
        });

        this.client.on('ready', () => {
            this.logger.log('Redis ready');
            this.isDown = false;
        });

        this.client.on('error', (err) => {
            const message = err?.message || err?.['code'] || err?.['errno'] || err?.['syscall'] || JSON.stringify(err);
            if (!this.isDown) this.logger.error(`Redis error: ${message}`);
            this.isDown = true;
        });

        this.client.on('end', () => {
            this.logger.warn('Redis connection closed');
            this.isDown = true;
        });
    }

    async onModuleInit() {
        try {
            await this.client.ping();
            this.isDown = false;
        } catch {
            this.logger.error('Redis is DOWN at startup');
            this.isDown = true;
        }
    }

    async safeGet(key: string): Promise<string | null> {
        if (this.isDown) return null;

        try {
            return await this.client.get(key);
        } catch (e) {
            this.logger.error(`safeGet failed: ${e.message}`);
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
