import { Controller, Get } from '@nestjs/common';
import { UsagesService } from './usages.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Authorize } from 'src/auth/decorators/auth.decorator';

@Authorize()
@ApiBearerAuth()
@ApiTags('Usage')
@Controller('api/usage')
export class UsagesController {
    constructor(private readonly usagesService: UsagesService) {}

    @Get('daily')
    getDaily() {
        return this.usagesService.getDaily();
    }

    @Get('top')
    getTop3() {
        return this.usagesService.getTop3();
    }
}
