import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { DEFAULT_CLIENT_EMAIL, DEFAULT_CLIENT_ID, DEFAULT_PASSWORD } from 'src/common/constants/default';

export class RegisterClientDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ default: DEFAULT_CLIENT_ID })
    clientId: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ default: 'client' })
    name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ default: DEFAULT_CLIENT_EMAIL })
    email: string;
}
