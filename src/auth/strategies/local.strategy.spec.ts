import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';

describe('LocalStrategy', () => {
    it('delegates validate to AuthService', async () => {
        const authService = {
            validateUser: jest.fn().mockResolvedValue({ id: 'a' }),
        } as unknown as AuthService;

        const strategy = new LocalStrategy(authService);
        const result = await strategy.validate('user', 'pass');

        expect(authService.validateUser).toHaveBeenCalledWith('user', 'pass');
        expect(result).toEqual({ id: 'a' });
    });
});

