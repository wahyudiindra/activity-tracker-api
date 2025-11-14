import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { RegisterClientDto } from './dto/register-client.dto';
import { CreateLogDto } from './dto/create-log.dto';
import { HEADER_API_KEY } from 'src/common/constants/default';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';

@Controller('api')
@ApiTags('Register & Logging')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {}

    @Post('register')
    register(@Body() data: RegisterClientDto) {
        return this.clientsService.register(data);
    }

    @Post('logs')
    @UseGuards(RateLimitGuard)
    @ApiHeader({ name: HEADER_API_KEY })
    async createLog(@Req() req, @Body() dto: CreateLogDto) {
        return this.clientsService.createLog(req.clientId, dto);
    }
}
