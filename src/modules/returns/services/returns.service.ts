import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PaymentService } from '../../payments/services/payment.service';
import { CreateReturnRequestDto, UpdateReturnStatusDto } from '../dto/return.dto';

@Injectable()
export class ReturnsService {
    private readonly logger = new Logger(ReturnsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly paymentService: PaymentService,
    ) { }

    // ─── Customer: Create Return Request ─────────────────────
    async createReturnRequest(userId: string, dto: CreateReturnRequestDto) {
        // 1. Fetch the order item with its vendor order and parent order
        const orderItem = await this.prisma.orderItem.findUnique({
            where: { id: dto.orderItemId },
            include: {
                vendorOrder: {
                    include: {
                        order: {
                            include: { payment: true },
                        },
                    },
                },
                returnRequest: true,
            },
        });

        if (!orderItem) {
            throw new NotFoundException('Order item not found');
        }

        // 2. Verify the order belongs to this user
        if (orderItem.vendorOrder.order.userId !== userId) {
            throw new ForbiddenException('You can only return items from your own orders');
        }

        // 3. The order must be DELIVERED to allow returns
        if (orderItem.vendorOrder.status !== 'DELIVERED') {
            throw new BadRequestException(
                `Returns are only allowed for delivered orders. Current status: ${orderItem.vendorOrder.status}`,
            );
        }

        // 4. Check return window (7 days from delivery)
        const deliveryDate = orderItem.vendorOrder.updatedAt;
        const returnWindowDays = 7;
        const returnDeadline = new Date(deliveryDate);
        returnDeadline.setDate(returnDeadline.getDate() + returnWindowDays);

        if (new Date() > returnDeadline) {
            throw new BadRequestException(
                `Return window has expired. Returns must be requested within ${returnWindowDays} days of delivery.`,
            );
        }

        // 5. Check if a return request already exists for this item
        if (orderItem.returnRequest) {
            throw new BadRequestException(
                `A return request already exists for this item (status: ${orderItem.returnRequest.status})`,
            );
        }

        // 6. Create the return request
        const returnRequest = await this.prisma.returnRequest.create({
            data: {
                orderItemId: dto.orderItemId,
                userId,
                reason: dto.reason,
            },
            include: {
                orderItem: {
                    include: {
                        product: { select: { id: true, name: true } },
                        variant: { select: { id: true, sku: true } },
                    },
                },
            },
        });

        this.logger.log(
            `Return request ${returnRequest.id} created by user ${userId} for order item ${dto.orderItemId}`,
        );

        return {
            message: 'Return request submitted successfully',
            returnRequest,
        };
    }

    // ─── Customer: Get My Returns ────────────────────────────
    async getMyReturns(userId: string) {
        return this.prisma.returnRequest.findMany({
            where: { userId },
            include: {
                orderItem: {
                    include: {
                        product: { select: { id: true, name: true, images: true } },
                        variant: { select: { id: true, sku: true, attributes: true } },
                        vendorOrder: {
                            select: {
                                id: true,
                                orderId: true,
                                vendor: { select: { id: true, storeName: true } },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // ─── Vendor/Admin: Update Return Status ──────────────────
    async updateReturnStatus(
        returnId: string,
        dto: UpdateReturnStatusDto,
        user: { id: string; role: string; vendor?: { id: string } },
    ) {
        const returnRequest = await this.prisma.returnRequest.findUnique({
            where: { id: returnId },
            include: {
                orderItem: {
                    include: {
                        vendorOrder: {
                            include: {
                                order: { include: { payment: true } },
                                vendor: true,
                            },
                        },
                    },
                },
            },
        });

        if (!returnRequest) {
            throw new NotFoundException('Return request not found');
        }

        // Authorization: ADMIN can update any, VENDOR can only update their own
        if (user.role === 'VENDOR') {
            if (!user.vendor || returnRequest.orderItem.vendorOrder.vendorId !== user.vendor.id) {
                throw new ForbiddenException('You can only manage returns for your own orders');
            }
        } else if (user.role !== 'ADMIN') {
            throw new ForbiddenException('Only vendors and admins can update return status');
        }

        // Validate status transition
        this.validateStatusTransition(returnRequest.status, dto.status);

        // Handle refund when status moves to REFUNDED
        let refundResult = null;
        if (dto.status === 'REFUNDED') {
            const order = returnRequest.orderItem.vendorOrder.order;
            const payment = order.payment;

            if (payment?.razorpayPaymentId && payment.status === 'PAID') {
                // Refund only the item amount, not the whole order
                const refundAmount = returnRequest.orderItem.total;
                try {
                    refundResult = await this.paymentService.refundPayment(
                        payment.razorpayPaymentId,
                        refundAmount,
                    );
                    this.logger.log(
                        `Refund initiated for return ${returnId}: ₹${refundAmount}`,
                    );
                } catch (error) {
                    this.logger.error(
                        `Refund failed for return ${returnId}: ${error}`,
                    );
                }
            }

            // Restore stock for the returned item
            if (returnRequest.orderItem.variantId) {
                await this.prisma.productVariant.update({
                    where: { id: returnRequest.orderItem.variantId },
                    data: { stock: { increment: returnRequest.orderItem.quantity } },
                });
            } else {
                await this.prisma.product.update({
                    where: { id: returnRequest.orderItem.productId },
                    data: { stock: { increment: returnRequest.orderItem.quantity } },
                });
            }

            // Deduct from vendor wallet
            const vendorOrder = returnRequest.orderItem.vendorOrder;
            const itemProportion = returnRequest.orderItem.total / vendorOrder.subtotal;
            const vendorDeduction = Math.round(vendorOrder.vendorAmount * itemProportion * 100) / 100;

            await this.prisma.vendorWallet.update({
                where: { vendorId: vendorOrder.vendorId },
                data: {
                    balance: { decrement: vendorDeduction },
                },
            });

            this.logger.log(
                `Vendor ${vendorOrder.vendorId} wallet deducted ₹${vendorDeduction} for return ${returnId}`,
            );
        }

        // Update the return request status
        const updated = await this.prisma.returnRequest.update({
            where: { id: returnId },
            data: {
                status: dto.status,
                adminNote: dto.adminNote ?? returnRequest.adminNote,
            },
            include: {
                orderItem: {
                    include: {
                        product: { select: { id: true, name: true } },
                        vendorOrder: {
                            select: {
                                id: true,
                                orderId: true,
                                vendor: { select: { id: true, storeName: true } },
                            },
                        },
                    },
                },
            },
        });

        this.logger.log(
            `Return ${returnId} status updated to ${dto.status}`,
        );

        return {
            message: `Return request status updated to ${dto.status}`,
            returnRequest: updated,
            refund: refundResult
                ? { status: 'initiated', details: refundResult }
                : undefined,
        };
    }

    // ─── Vendor: Get Returns for My Store ────────────────────
    async getVendorReturns(vendorId: string) {
        return this.prisma.returnRequest.findMany({
            where: {
                orderItem: {
                    vendorOrder: {
                        vendorId,
                    },
                },
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                orderItem: {
                    include: {
                        product: { select: { id: true, name: true, images: true } },
                        variant: { select: { id: true, sku: true, attributes: true } },
                        vendorOrder: {
                            select: { id: true, orderId: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // ─── Status Transition Validation ────────────────────────
    private validateStatusTransition(current: string, next: string) {
        const validTransitions: Record<string, string[]> = {
            REQUESTED: ['APPROVED', 'REJECTED'],
            APPROVED: ['PICKED_UP'],
            PICKED_UP: ['RECEIVED'],
            RECEIVED: ['REFUNDED'],
        };

        const allowed = validTransitions[current];
        if (!allowed || !allowed.includes(next)) {
            throw new BadRequestException(
                `Cannot transition from ${current} to ${next}. Allowed transitions: ${allowed?.join(', ') || 'none (terminal state)'}`,
            );
        }
    }
}
