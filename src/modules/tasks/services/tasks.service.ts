import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { ReservationStatus } from '@prisma/client';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(private readonly prisma: PrismaService) { }

    // Every minute check for expired reservations
    @Cron(CronExpression.EVERY_MINUTE)
    async handleExpiredReservations() {
        const expiredReservations = await this.prisma.stockReservation.findMany({
            where: {
                status: ReservationStatus.ACTIVE,
                expiresAt: { lt: new Date() },
            },
        });

        if (expiredReservations.length === 0) return;

        for (const reservation of expiredReservations) {
            await this.prisma.$transaction(async (tx: any) => {
                // Return stock
                if (reservation.variantId) {
                    await tx.productVariant.update({
                        where: { id: reservation.variantId },
                        data: { stock: { increment: reservation.quantity } },
                    });
                } else {
                    await tx.product.update({
                        where: { id: reservation.productId },
                        data: { stock: { increment: reservation.quantity } },
                    });
                }

                // Delete or expire the record
                await tx.stockReservation.update({
                    where: { id: reservation.id },
                    data: { status: ReservationStatus.EXPIRED },
                });
            });
        }

        this.logger.log(`Cleaned up ${expiredReservations.length} expired stock reservations and returned items to inventory.`);
    }

    // Daily cleanup of idempotency keys & very old reservations
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailyCleanup() {
        const deletedKeys = await this.prisma.idempotencyKey.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });

        // Delete expired reservation records older than 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const deletedReservations = await this.prisma.stockReservation.deleteMany({
            where: {
                status: ReservationStatus.EXPIRED,
                createdAt: { lt: sevenDaysAgo },
            },
        });

        this.logger.log(`Daily cleanup: Removed ${deletedKeys.count} expired Idempotency keys & ${deletedReservations.count} old StockReservations.`);
    }
}
