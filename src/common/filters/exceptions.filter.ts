import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, HttpException } from '@nestjs/common';
import { isObject } from 'class-validator';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        if (exception instanceof HttpException) {
            const statusCode = exception?.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;

            let message = exception.getResponse() || 'Internal server error';
            if (isObject(message)) message = message?.['message'];

            response.status(statusCode).json({ statusCode, message });
        } else {
            console.error(`[Error......]`, exception);
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal Server Error',
                ...(process.env.NODE_ENV !== 'production' && {
                    error: (exception as any)?.message || 'An unexpected error occurred',
                    timestamp: new Date().toISOString(),
                    path: request.url,
                }),
            });
        }
    }
}
