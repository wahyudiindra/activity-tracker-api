import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
    imports: [CommonModule],
    controllers: [ClientsController],
    providers: [ClientsService],
})
export class ClientsModule {}
