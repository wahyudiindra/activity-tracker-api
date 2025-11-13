import { Module } from '@nestjs/common';
import { UsagesService } from './usages.service';
import { UsagesController } from './usages.controller';
import { CommonModule } from 'src/common/common.module';
import { CachesModule } from 'src/caches/caches.module';

@Module({
    imports: [CommonModule, CachesModule],
    controllers: [UsagesController],
    providers: [UsagesService],
})
export class UsagesModule {}
