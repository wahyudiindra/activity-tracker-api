import { Module } from '@nestjs/common';
import { UsagesService } from './usages.service';
import { UsagesController } from './usages.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
    imports: [CommonModule],
    controllers: [UsagesController],
    providers: [UsagesService],
})
export class UsagesModule {}
