import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { CommonModule } from 'src/common/common.module';
import { CachesModule } from 'src/caches/caches.module';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';

@Module({
    imports: [CommonModule, CachesModule],
    controllers: [ClientsController],
    providers: [ClientsService, RateLimitGuard],
})
export class ClientsModule {}
