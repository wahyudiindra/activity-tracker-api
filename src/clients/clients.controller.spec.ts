import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

describe('ClientsController', () => {
    let controller: ClientsController;
    let service: jest.Mocked<ClientsService>;

    beforeEach(() => {
        service = {
            register: jest.fn(),
            createLog: jest.fn(),
        } as unknown as jest.Mocked<ClientsService>;

        controller = new ClientsController(service);
    });

    it('register forwards payload to service', async () => {
        const dto = { clientId: 'c1', email: 'a@test.com', name: 'A' } as any;
        service.register.mockResolvedValue({ id: '1' } as any);

        const result = await controller.register(dto);
        expect(service.register).toHaveBeenCalledWith(dto);
        expect(result).toEqual({ id: '1' });
    });

    it('createLog uses clientId from request', async () => {
        const req = { clientId: 'client-1' };
        const dto = { endpoint: '/foo', ip: '1.1.1.1' } as any;
        service.createLog.mockResolvedValue({ queued: true } as any);

        const result = await controller.createLog(req as any, dto);
        expect(service.createLog).toHaveBeenCalledWith('client-1', dto);
        expect(result).toEqual({ queued: true });
    });
});

