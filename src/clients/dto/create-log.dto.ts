import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLogDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ default: 'forgot-password' })
    endpoint: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ default: '127.123.11.1' })
    ip: string;
}
