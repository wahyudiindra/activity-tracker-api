import { RedisService } from './redis.service';

const eventHandlers: Record<string, (...args: any[]) => void> = {};

const redisClientMock = {
    on: jest.fn((event: string, handler: (...args: any[]) => void) => {
        eventHandlers[event] = handler;
    }),
    ping: jest.fn().mockResolvedValue('PONG'),
    get: jest.fn(),
    set: jest.fn(),
};

jest.mock('ioredis', () => {
    const RedisMock = jest.fn().mockImplementation(() => redisClientMock);
    return { __esModule: true, default: RedisMock };
});

describe('RedisService', () => {
    let service: RedisService;

    beforeEach(() => {
        jest.clearAllMocks();
        for (const key of Object.keys(eventHandlers)) delete eventHandlers[key];

        redisClientMock.ping.mockResolvedValue('PONG');
        redisClientMock.get.mockReset();
        redisClientMock.set.mockReset();

        service = new RedisService();
    });

    it('sets isDown=false on ready event', () => {
        service['isDown'] = true;
        eventHandlers['ready']?.();
        expect(service.isDown).toBe(false);
    });

    it('marks redis down when error event occurs', () => {
        service['isDown'] = false;
        eventHandlers['error']?.(new Error('boom'));
        expect(service.isDown).toBe(true);
    });

    it('ping success resets isDown', async () => {
        service['isDown'] = true;
        await service.onModuleInit();
        expect(service.isDown).toBe(false);
    });

    it('safeGet returns null when redis down', async () => {
        service.isDown = true;
        const result = await service.safeGet('key');
        expect(result).toBeNull();
        expect(redisClientMock.get).not.toHaveBeenCalled();
    });

    it('safeGet returns value and parses errors', async () => {
        service.isDown = false;
        redisClientMock.get.mockResolvedValueOnce('value');

        const value = await service.safeGet('key');
        expect(value).toBe('value');

        redisClientMock.get.mockRejectedValueOnce(new Error('fail'));
        const fallback = await service.safeGet('key');
        expect(fallback).toBeNull();
        expect(service.isDown).toBe(true);
    });

    it('safeSet skips when down and handles errors', async () => {
        service.isDown = true;
        await service.safeSet('key', 'value', 10);
        expect(redisClientMock.set).not.toHaveBeenCalled();

        service.isDown = false;
        redisClientMock.set.mockResolvedValueOnce('OK');
        await service.safeSet('key', 'value', 10);
        expect(redisClientMock.set).toHaveBeenCalledWith('key', 'value', 'EX', 10);

        redisClientMock.set.mockRejectedValueOnce(new Error('boom'));
        await service.safeSet('key', 'value', 10);
        expect(service.isDown).toBe(true);
    });
});
