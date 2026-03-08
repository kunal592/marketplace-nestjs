import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { PrismaService } from '../../database/prisma.service';
import { IdempotencyStatus } from '@prisma/client';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
    constructor(private readonly prisma: PrismaService) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest();
        const idempotencyKey = req.headers['idempotency-key'] as string;

        if (!idempotencyKey) {
            throw new HttpException('Idempotency-Key header is required', HttpStatus.BAD_REQUEST);
        }

        const existingKey = await this.prisma.idempotencyKey.findUnique({
            where: { key: idempotencyKey },
        });

        if (existingKey) {
            if (existingKey.status === IdempotencyStatus.COMPLETED) {
                // Return cached response bypassing actual execution
                throw new HttpException((existingKey.responseBody as any) ?? { message: "Already processed" }, HttpStatus.OK);
            } else if (existingKey.status === IdempotencyStatus.PROCESSING) {
                throw new HttpException('Request already in progress', HttpStatus.CONFLICT);
            }
        }

        // Create new idempotency record
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const newKey = await this.prisma.idempotencyKey.upsert({
            where: { key: idempotencyKey },
            update: {
                status: IdempotencyStatus.PROCESSING,
                expiresAt: new Date(Date.now() + twentyFourHours),
            },
            create: {
                key: idempotencyKey,
                endpoint: req.originalUrl,
                userId: req.user?.id,
                status: IdempotencyStatus.PROCESSING,
                expiresAt: new Date(Date.now() + twentyFourHours),
            },
        });

        return next.handle().pipe(
            tap(async (responseBody) => {
                await this.prisma.idempotencyKey.update({
                    where: { id: newKey.id },
                    data: {
                        status: IdempotencyStatus.COMPLETED,
                        responseBody: responseBody as any,
                    },
                });
            }),
            catchError((err) => {
                this.prisma.idempotencyKey.update({
                    where: { id: newKey.id },
                    data: {
                        status: IdempotencyStatus.FAILED,
                    },
                }).catch(console.error);
                return throwError(() => err);
            }),
        );
    }
}
