import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Admin } from '@prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ usernameField: 'identifier' });
    }

    validate(identifier: string, password: string): Promise<Admin> {
        return this.authService.validateUser(identifier, password);
    }
}
