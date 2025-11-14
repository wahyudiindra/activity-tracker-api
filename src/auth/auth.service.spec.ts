import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/common/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let jwtService: jest.Mocked<JwtService>;
    let prisma: {
        admin: {
            findFirst: jest.Mock;
        };
    };

    const adminMock = { id: 'admin-1', email: 'admin@test.com', password: 'hashed' } as any;

    beforeEach(() => {
        jwtService = {
            sign: jest.fn(),
        } as unknown as jest.Mocked<JwtService>;

        prisma = {
            admin: {
                findFirst: jest.fn(),
            },
        };

        service = new AuthService(jwtService, prisma as unknown as PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('validateUser', () => {
        it('throws when admin not found', async () => {
            prisma.admin.findFirst.mockResolvedValue(null);

            await expect(service.validateUser('a@test.com', 'pass')).rejects.toThrow(BadRequestException);
        });

        it('throws when password mismatch', async () => {
            prisma.admin.findFirst.mockResolvedValue(adminMock);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.validateUser('a@test.com', 'pass')).rejects.toThrow(BadRequestException);
        });

        it('returns admin when credentials valid', async () => {
            prisma.admin.findFirst.mockResolvedValue(adminMock);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser('a@test.com', 'pass');

            expect(result).toBe(adminMock);
        });
    });

    describe('signIn', () => {
        it('returns access token and user payload', async () => {
            jwtService.sign.mockReturnValue('token');

            const response = await service.signIn(adminMock);

            expect(jwtService.sign).toHaveBeenCalledWith({ id: adminMock.id, email: adminMock.email });
            expect(response).toEqual({ accessToken: 'token', user: adminMock });
        });
    });
});

