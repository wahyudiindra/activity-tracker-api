import { Module } from '@nestjs/common';
import { UsagesService } from './usages.service';
import { UsagesController } from './usages.controller';
import { CommonModule } from 'src/common/common.module';
import { CachesModule } from 'src/caches/caches.module';
import { UsageCachePrewarmService } from './usage-cache-prewarm.service';

@Module({
    imports: [CommonModule, CachesModule],
    controllers: [UsagesController],
    providers: [UsagesService, UsageCachePrewarmService],
})
export class UsagesModule {}
