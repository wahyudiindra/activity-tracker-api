import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_PASSWORD } from 'src/common/constants/default';

export class SignInDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ default: DEFAULT_ADMIN_EMAIL })
    identifier: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ default: DEFAULT_PASSWORD })
    password: string;
}
