import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: jest.Mocked<AuthService>;

    beforeEach(() => {
        authService = {
            signIn: jest.fn(),
        } as unknown as jest.Mocked<AuthService>;

        controller = new AuthController(authService);
    });

    it('delegates signIn to AuthService', async () => {
        const req = { user: { id: '1' } };
        authService.signIn.mockResolvedValue({ accessToken: 'token' } as any);

        const result = await controller.signIn({} as any, req as any);
        expect(authService.signIn).toHaveBeenCalledWith(req.user);
        expect(result).toEqual({ accessToken: 'token' });
    });

    it('returns current user for authMe', () => {
        const req = { user: { id: '1', email: 'a@test.com' } };
        expect(controller.authMe(req as any)).toEqual(req.user);
    });
});

