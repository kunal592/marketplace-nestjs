import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status: number;
        let message: string;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const responseObj = exceptionResponse as Record<string, unknown>;
                message = (responseObj.message as string) || exception.message;

                // Handle class-validator array messages
                if (Array.isArray(responseObj.message)) {
                    message = (responseObj.message as string[]).join(', ');
                }
            } else {
                message = exception.message;
            }
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';

            // Log unexpected errors in full
            this.logger.error(
                `Unexpected error on ${request.method} ${request.url}`,
                exception instanceof Error ? exception.stack : String(exception),
            );
        }

        response.status(status).json({
            success: false,
            message,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
