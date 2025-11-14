import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UsagesService } from './usages.service';

@Injectable()
export class UsageCachePrewarmService implements OnApplicationBootstrap {
    private readonly logger = new Logger(UsageCachePrewarmService.name);

    constructor(private readonly usagesService: UsagesService) {}

    async onApplicationBootstrap() {
        const targets: Array<{ label: string; warm: () => Promise<unknown> }> = [
            { label: 'usage/daily', warm: () => this.usagesService.getDaily() },
            { label: 'usage/top', warm: () => this.usagesService.getTop3() },
        ];

        await Promise.all(
            targets.map(async ({ label, warm }) => {
                const startedAt = Date.now();
                try {
                    await warm();
                    const duration = Date.now() - startedAt;
                    this.logger.log(`Pre-warmed cache for ${label} in ${duration}ms`);
                } catch (error) {
                    this.logger.warn(`Skipped cache pre-warm for ${label}: ${error?.message ?? error}`);
                }
            }),
        );
    }
}
