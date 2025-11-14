import { UsageCachePrewarmService } from './usage-cache-prewarm.service';
import { UsagesService } from './usages.service';

describe('UsageCachePrewarmService', () => {
    let service: UsageCachePrewarmService;
    let usagesService: jest.Mocked<UsagesService>;
    let logSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        usagesService = {
            getDaily: jest.fn(),
            getTop3: jest.fn(),
        } as unknown as jest.Mocked<UsagesService>;

        service = new UsageCachePrewarmService(usagesService);
        logSpy = jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
        warnSpy = jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('pre-warms both usage endpoints', async () => {
        usagesService.getDaily.mockResolvedValue({ daily: true } as any);
        usagesService.getTop3.mockResolvedValue({ top: true } as any);

        await service.onApplicationBootstrap();

        expect(usagesService.getDaily).toHaveBeenCalledTimes(1);
        expect(usagesService.getTop3).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/Pre-warmed cache for usage\/daily/));
        expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/usage\/top/));
    });

    it('logs warning when a warm target fails but continues others', async () => {
        usagesService.getDaily.mockRejectedValue(new Error('boom'));
        usagesService.getTop3.mockResolvedValue({} as any);

        await service.onApplicationBootstrap();

        expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/usage\/daily/));
        expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/usage\/top/));
    });
});

