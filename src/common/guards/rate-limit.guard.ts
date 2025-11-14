import { CanActivate, ExecutionContext, HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { RateLimitService } from 'src/caches/rate-limit.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
    constructor(private readonly rateLimitService: RateLimitService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const clientId: string | undefined = request.clientId;
        if (!clientId) return true;

        const result = await this.rateLimitService.consume(clientId);
        request.rateLimit = result;

        if (!result.allowed) {
            throw new HttpException(
                `Rate limit exceeded. Try again in ${result.retryAfterSeconds} seconds.`,
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        return true;
    }
}
