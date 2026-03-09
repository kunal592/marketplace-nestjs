import {
    Injectable,
    BadRequestException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { RequestPayoutDto } from '../dto/payout.dto';
import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class PayoutService {
    private readonly logger = new Logger(PayoutService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
    ) { }

    async requestPayout(vendorId: string, dto: RequestPayoutDto) {
        const wallet = await this.prisma.vendorWallet.findUnique({
            where: { vendorId },
        });

        if (!wallet) {
            throw new NotFoundException('Wallet not found');
        }

        if (wallet.balance < dto.amount) {
            throw new BadRequestException(
                `Insufficient balance. Available: ₹${wallet.balance}`,
            );
        }

        // Create payout request and deduct balance
        const [payout] = await this.prisma.$transaction([
            this.prisma.payoutRequest.create({
                data: {
                    vendorId,
                    amount: dto.amount,
                },
            }),
            this.prisma.vendorWallet.update({
                where: { vendorId },
                data: {
                    balance: { decrement: dto.amount },
                },
            }),
        ]);

        this.logger.log(`Payout requested: ₹${dto.amount} by vendor ${vendorId}`);

        return payout;
    }

    async getVendorPayouts(vendorId: string) {
        return this.prisma.payoutRequest.findMany({
            where: { vendorId },
            orderBy: { requestedAt: 'desc' },
        });
    }

    async getAllPayoutRequests() {
        return this.prisma.payoutRequest.findMany({
            include: {
                vendor: {
                    select: { id: true, storeName: true },
                },
            },
            orderBy: { requestedAt: 'desc' },
        });
    }

    async processPayoutRequest(payoutId: string, approved: boolean) {
        const payout = await this.prisma.payoutRequest.findUnique({
            where: { id: payoutId },
        });

        if (!payout) {
            throw new NotFoundException('Payout request not found');
        }

        if (payout.status !== 'PENDING') {
            throw new BadRequestException('Payout request already processed');
        }

        if (approved) {
            await this.prisma.payoutRequest.update({
                where: { id: payoutId },
                data: {
                    status: 'COMPLETED',
                    processedAt: new Date(),
                },
            });
            this.logger.log(`Payout approved: ${payoutId}`);

            // Notify vendor
            const pRequest = await this.prisma.payoutRequest.findUnique({
                where: { id: payoutId },
                include: { vendor: true },
            });
            if (pRequest?.vendor?.userId) {
                await this.notificationsService.createNotification(
                    pRequest.vendor.userId,
                    'PAYOUT_APPROVED',
                    'Payout Approved',
                    `Your payout of ₹${pRequest.amount} has been approved and processed.`,
                );
            }
        } else {
            // Refund balance on rejection
            await this.prisma.$transaction([
                this.prisma.payoutRequest.update({
                    where: { id: payoutId },
                    data: {
                        status: 'REJECTED',
                        processedAt: new Date(),
                    },
                }),
                this.prisma.vendorWallet.update({
                    where: { vendorId: payout.vendorId },
                    data: {
                        balance: { increment: payout.amount },
                    },
                }),
            ]);
            this.logger.log(`Payout rejected: ${payoutId}. Balance refunded.`);
        }

        return { message: approved ? 'Payout approved' : 'Payout rejected' };
    }
}
