import { UsagesController } from './usages.controller';
import { UsagesService } from './usages.service';

describe('UsagesController', () => {
    let controller: UsagesController;
    let service: jest.Mocked<UsagesService>;

    beforeEach(() => {
        service = {
            getDaily: jest.fn(),
            getTop3: jest.fn(),
        } as unknown as jest.Mocked<UsagesService>;

        controller = new UsagesController(service);
    });

    it('returns daily usage from service', async () => {
        service.getDaily.mockResolvedValue({ totalRequest: 1 } as any);
        const result = await controller.getDaily();
        expect(service.getDaily).toHaveBeenCalled();
        expect(result).toEqual({ totalRequest: 1 });
    });

    it('returns top usage from service', async () => {
        service.getTop3.mockResolvedValue({ totalRequest: 3 } as any);
        const result = await controller.getTop3();
        expect(service.getTop3).toHaveBeenCalled();
        expect(result).toEqual({ totalRequest: 3 });
    });
});

