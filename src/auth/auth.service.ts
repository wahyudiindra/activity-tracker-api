import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) {}

    async validateUser(identifier: string, password: string): Promise<Admin> {
        const admin = await this.prisma.admin.findFirst({ where: { email: identifier } });
        if (!admin) throw new BadRequestException('Invalid Credential');

        const authorized = await bcrypt.compare(password, admin.password);
        if (!authorized) throw new BadRequestException('Invalid Credential');

        return admin;
    }

    async signIn(user: Admin) {
        const { id, email } = user;
        return { accessToken: this.jwtService.sign({ id, email }), user };
    }
}
