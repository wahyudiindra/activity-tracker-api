import { Body, Controller, Post, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/sign-in.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { PasswordMaskInterceptor } from 'src/common/interceptors/password-mask.interceptor';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signin')
    @UseGuards(LocalAuthGuard)
    @UseInterceptors(PasswordMaskInterceptor)
    signIn(@Body() _data: SignInDto, @Request() req) {
        return this.authService.signIn(req.user);
    }
}
