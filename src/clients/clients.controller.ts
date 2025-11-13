import { Body, Controller, Post } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ApiTags } from '@nestjs/swagger';
import { RegisterClientDto } from './dto/register-client.dto';

@Controller('api')
@ApiTags('Register & Logging')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {}

    @Post('register')
    register(@Body() data: RegisterClientDto) {
        return this.clientsService.register(data);
    }
}
