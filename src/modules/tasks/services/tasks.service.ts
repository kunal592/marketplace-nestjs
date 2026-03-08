import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { ReservationStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import Razorpay = require('razorpay');

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);
    private readonly razorpay: InstanceType<typeof Razorpay>;

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        this.razorpay = new Razorpay({
            key_id: this.configService.get<string>('razorpay.keyId', ''),
            key_secret: this.configService.get<string>('razorpay.secret', ''),
        });
    }

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

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailyReconciliation() {
        this.logger.log('Starting daily wallet & payment reconciliation...');

        // 1. Wallet Reconciliation
        const vendors = await this.prisma.vendor.findMany({ include: { wallet: true } });
        for (const vendor of vendors) {
            if (!vendor.wallet) continue;

            const vendorOrders = await this.prisma.vendorOrder.findMany({
                where: { vendorId: vendor.id, order: { paymentStatus: 'PAID' } }
            });

            const calculatedPending = vendorOrders
                .filter((vo: any) => vo.status !== 'DELIVERED')
                .reduce((sum: number, vo: any) => sum + vo.vendorAmount, 0);

            const calculatedAvailable = vendorOrders
                .filter((vo: any) => vo.status === 'DELIVERED')
                .reduce((sum: number, vo: any) => sum + vo.vendorAmount, 0);

            // subtract fulfilled payouts
            const payouts = await this.prisma.payoutRequest.findMany({
                where: { vendorId: vendor.id, status: 'COMPLETED' }
            });
            const totalPayouts = payouts.reduce((sum: number, p: any) => sum + p.amount, 0);

            const expectedBalance = calculatedAvailable - totalPayouts;

            if (Math.abs(expectedBalance - vendor.wallet.balance) > 0.01 ||
                Math.abs(calculatedPending - vendor.wallet.pendingBalance) > 0.01) {
                this.logger.error(`Wallet Discrepancy Found for Vendor ${vendor.id}: Expected Balance: ${expectedBalance}, Actual: ${vendor.wallet.balance} | Expected Pending: ${calculatedPending}, Actual: ${vendor.wallet.pendingBalance}`);
            }
        }

        // 2. Data Integrity Checks (Order totals match order items)
        const orders = await this.prisma.order.findMany({
            include: { vendorOrders: { include: { items: true } } }
        });

        for (const order of orders) {
            const calculatedTotal = order.vendorOrders.reduce((sum: number, vo: any) => {
                return sum + vo.items.reduce((itemSum: number, item: any) => itemSum + item.total, 0);
            }, 0);

            if (Math.abs(calculatedTotal - order.totalAmount) > 0.01) {
                this.logger.error(`Order Total Discrepancy Found for Order ${order.id}: Expected: ${calculatedTotal}, Actual: ${order.totalAmount}`);
            }
        }

        // 3. Payment Reconciliation (Recover missing payments)
        const pendingPayments = await this.prisma.payment.findMany({
            where: { status: 'PENDING', createdAt: { lt: new Date(Date.now() - 60 * 60 * 1000) } } // Older than 1hr
        });

        for (const payment of pendingPayments) {
            if (payment.razorpayOrderId) {
                try {
                    const rzpOrder = await this.razorpay.orders.fetch(payment.razorpayOrderId);
                    if (rzpOrder.status === 'paid') {
                        const payments = await this.razorpay.orders.fetchPayments(payment.razorpayOrderId);
                        for (const p of payments.items) {
                            if (p.status === 'captured') {
                                await this.prisma.$transaction([
                                    this.prisma.payment.update({
                                        where: { id: payment.id },
                                        data: { status: 'PAID', razorpayPaymentId: p.id }
                                    }),
                                    this.prisma.order.update({
                                        where: { id: payment.orderId },
                                        data: { paymentStatus: 'PAID', orderStatus: 'PROCESSING' }
                                    })
                                ]);
                                this.logger.log(`Found and recovered missing payment for order ${payment.orderId}`);
                            }
                        }
                    }
                } catch (e: any) {
                    this.logger.error(`Failed to fetch razorpay order ${payment.razorpayOrderId}: ${e.message}`);
                }
            }
        }

        this.logger.log('Daily reconciliation and integrity checks completed.');
    }
}
