import { SetMetadata, UseGuards } from '@nestjs/common';
import { JwtGuard } from './../guards/jwt.guard';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const Authorize = () => UseGuards(JwtGuard);
