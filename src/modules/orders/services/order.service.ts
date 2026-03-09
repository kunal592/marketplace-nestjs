import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderRepository } from '../repositories/order.repository';
import { PrismaService } from '../../../database/prisma.service';
import { PaymentService } from '../../payments/services/payment.service';
import { TaxService } from '../../tax/services/tax.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class OrderService {
    private readonly logger = new Logger(OrderService.name);

    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly paymentService: PaymentService,
        private readonly taxService: TaxService,
        private readonly notificationsService: NotificationsService,
    ) { }

    // ─── Order Cancellation ──────────────────────────────────
    async cancelOrder(orderId: string, userId: string) {
        return this.prisma.$transaction(async (tx: any) => {
            // 1. Fetch order with all relations needed
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: {
                    vendorOrders: {
                        include: {
                            items: true,
                        },
                    },
                    payment: true,
                },
            });

            if (!order) {
                throw new NotFoundException('Order not found');
            }

            // 2. Validate ownership
            if (order.userId !== userId) {
                throw new ForbiddenException('You can only cancel your own orders');
            }

            // 3. Validate cancellable status
            const cancellableStatuses = ['CREATED', 'PROCESSING'];
            if (!cancellableStatuses.includes(order.orderStatus)) {
                throw new BadRequestException(
                    `Order cannot be cancelled. Current status: ${order.orderStatus}. Only orders with status CREATED or PROCESSING can be cancelled.`,
                );
            }

            // 4. Update all vendor orders to CANCELLED
            for (const vendorOrder of order.vendorOrders) {
                await tx.vendorOrder.update({
                    where: { id: vendorOrder.id },
                    data: { status: 'CANCELLED' },
                });

                // 5. Restore reserved stock for each item
                for (const item of vendorOrder.items) {
                    if (item.variantId) {
                        await tx.productVariant.update({
                            where: { id: item.variantId },
                            data: { stock: { increment: item.quantity } },
                        });
                    } else {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stock: { increment: item.quantity } },
                        });
                    }
                }

                // 6. Reverse vendor pending balance
                await tx.vendorWallet.update({
                    where: { vendorId: vendorOrder.vendorId },
                    data: {
                        pendingBalance: { decrement: vendorOrder.vendorAmount },
                    },
                });

                // Update shipment status to RETURNED if exists
                const shipment = await tx.shipment.findUnique({
                    where: { vendorOrderId: vendorOrder.id },
                });
                if (shipment) {
                    await tx.shipment.update({
                        where: { vendorOrderId: vendorOrder.id },
                        data: { status: 'RETURNED' },
                    });
                }
            }

            // 7. Cancel any active stock reservations for this user's order items
            const productIds = order.vendorOrders.flatMap(
                (vo: any) => vo.items.map((item: any) => item.productId),
            );
            await tx.stockReservation.updateMany({
                where: {
                    userId,
                    productId: { in: productIds },
                    status: 'ACTIVE',
                },
                data: { status: 'CANCELLED' },
            });

            // 8. Handle refund if payment was completed
            let refundResult = null;
            if (order.paymentStatus === 'PAID' && order.payment?.razorpayPaymentId) {
                try {
                    refundResult = await this.paymentService.refundPayment(
                        order.payment.razorpayPaymentId,
                        order.totalAmount,
                    );
                    this.logger.log(
                        `Refund initiated for order ${orderId}: ${JSON.stringify(refundResult)}`,
                    );
                } catch (error) {
                    this.logger.error(
                        `Refund failed for order ${orderId}: ${error}`,
                    );
                    // We still cancel the order but log the refund failure
                }

                // Update payment status to REFUNDED
                await tx.payment.update({
                    where: { orderId },
                    data: { status: 'REFUNDED' },
                });
            }

            // 9. Update order status
            const cancelledOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    orderStatus: 'CANCELLED',
                    paymentStatus: order.paymentStatus === 'PAID' ? 'REFUNDED' : order.paymentStatus,
                },
                include: {
                    vendorOrders: {
                        include: {
                            vendor: { select: { id: true, storeName: true } },
                            items: true,
                        },
                    },
                    payment: true,
                },
            });

            this.logger.log(
                `Order ${orderId} cancelled by user ${userId}. Refund: ${refundResult ? 'initiated' : 'not applicable'}`,
            );

            return {
                message: 'Order cancelled successfully',
                order: cancelledOrder,
                refund: refundResult
                    ? { status: 'initiated', details: refundResult }
                    : { status: order.paymentStatus === 'PAID' ? 'pending' : 'not_applicable' },
            };
        });
    }

    async createOrder(userId: string, shippingAddressId: string, couponCode?: string) {
        // Fetch and validate the shipping address
        const address = await this.prisma.address.findUnique({
            where: { id: shippingAddressId },
        });

        if (!address || address.userId !== userId) {
            throw new BadRequestException('Invalid shipping address');
        }

        // Get cart with items
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                price: true,
                                discountPrice: true,
                                vendorId: true,
                                stock: true,
                                status: true,
                                name: true,
                            },
                        },
                        variant: true,
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            throw new BadRequestException('Cart is empty');
        }

        // Validate stock
        for (const item of cart.items) {
            if (item.product.status !== 'ACTIVE') {
                throw new BadRequestException(`Product "${item.product.name}" is no longer available`);
            }
            const availableStock = item.variant?.stock ?? item.product.stock;
            if (availableStock < item.quantity) {
                throw new BadRequestException(
                    `Insufficient stock for "${item.product.name}". Available: ${availableStock}`,
                );
            }
        }

        let coupon = null;
        if (couponCode) {
            const check = await this.applyCoupon(userId, couponCode, cart.items);
            if (!check.valid) {
                throw new BadRequestException('Invalid coupon');
            }
            coupon = check.coupon;
        }

        const commissionPercent = this.configService.get<number>('platform.commissionPercent', 10);

        // Look up applicable tax rate based on shipping address
        const taxRate = await this.taxService.findTaxRate(
            address.country,
            address.state ?? undefined,
        );
        const taxPercentage = taxRate?.taxPercentage ?? 0;

        const order = await this.orderRepository.createOrder(
            userId,
            cart.id,
            cart.items,
            commissionPercent,
            address,
            coupon,
            taxPercentage,
        );

        this.logger.log(`Order created: ${order?.id} by user ${userId} (tax: ${taxPercentage}%)`);

        // Send Notification
        if (order) {
            await this.notificationsService.createNotification(
                userId,
                'ORDER_CREATED',
                'Order Confirmed!',
                `Your order #${order.id} has been successfully placed.`,
            );
        }

        return order;
    }

    async applyCoupon(userId: string, couponCode: string, predefinedItems?: any[]) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { code: couponCode },
        });

        if (!coupon) throw new BadRequestException('Coupon not found');
        if (coupon.expiresAt < new Date()) throw new BadRequestException('Coupon expired');
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new BadRequestException('Coupon usage limit reached');

        let items = predefinedItems;
        if (!items) {
            const cart = await this.prisma.cart.findUnique({
                where: { userId },
                include: { items: { include: { product: true, variant: true } } }
            });
            if (!cart || cart.items.length === 0) throw new BadRequestException('Cart is empty');
            items = cart.items;
        }

        // Calculate order items total
        let eligibleTotal = 0;
        let orderTotal = 0;

        for (const item of (items || [])) {
            const price = item.variant?.price ?? item.product.discountPrice ?? item.product.price;
            const lineTotal = price * item.quantity;
            orderTotal += lineTotal;

            if (!coupon.vendorId || coupon.vendorId === item.product.vendorId) {
                eligibleTotal += lineTotal;
            }
        }

        if (orderTotal < coupon.minOrderAmount) {
            throw new BadRequestException(`Minimum order amount is ${coupon.minOrderAmount}`);
        }

        let discountAmount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = eligibleTotal * (coupon.discountValue / 100);
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        } else {
            discountAmount = coupon.discountValue;
        }

        // Ensure discount doesn't exceed eligible total
        discountAmount = Math.min(discountAmount, eligibleTotal);

        return {
            valid: true,
            coupon,
            orderTotal,
            discountAmount,
            newTotal: Math.max(0, orderTotal - discountAmount)
        };
    }

    async getMyOrders(userId: string, query: PaginationDto) {
        return this.orderRepository.findByUserId(userId, query);
    }

    async getOrderById(orderId: string, userId: string) {
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return order;
    }

    async getVendorOrders(vendorId: string, query: PaginationDto) {
        return this.orderRepository.findVendorOrders(vendorId, query);
    }

    async updateVendorOrderStatus(vendorOrderId: string, vendorId: string, status: string) {
        const vendorOrder = await this.prisma.vendorOrder.findUnique({
            where: { id: vendorOrderId },
        });

        if (!vendorOrder) {
            throw new NotFoundException('Vendor order not found');
        }

        if (vendorOrder.vendorId !== vendorId) {
            throw new ForbiddenException('Access denied');
        }

        const updated = await this.orderRepository.updateVendorOrderStatus(vendorOrderId, status);

        // If delivered, move pending balance to available balance
        if (status === 'DELIVERED') {
            await this.prisma.vendorWallet.update({
                where: { vendorId },
                data: {
                    balance: { increment: vendorOrder.vendorAmount },
                    pendingBalance: { decrement: vendorOrder.vendorAmount },
                },
            });
            this.logger.log(`Vendor order ${vendorOrderId} delivered. Wallet updated for vendor ${vendorId}`);
        }

        // Send shipment/delivery notification
        const parentOrder = await this.prisma.order.findUnique({ where: { id: updated.orderId } });

        if (parentOrder && (status === 'SHIPPED' || status === 'DELIVERED')) {
            const type = status === 'SHIPPED' ? 'ORDER_SHIPPED' : 'ORDER_DELIVERED';
            const title = status === 'SHIPPED' ? 'Order Shipped!' : 'Order Delivered!';
            const msg = status === 'SHIPPED'
                ? `Your items from vendor order #${vendorOrderId} have been shipped.`
                : `Your items from vendor order #${vendorOrderId} have been delivered. Enjoy!`;

            await this.notificationsService.createNotification(parentOrder.userId, type, title, msg);
        }

        return updated;
    }

    async createShipment(vendorOrderId: string, vendorId: string, dto: any) {
        const vendorOrder = await this.prisma.vendorOrder.findUnique({
            where: { id: vendorOrderId },
        });

        if (!vendorOrder || vendorOrder.vendorId !== vendorId) {
            throw new NotFoundException('Vendor order not found or unauthorized');
        }

        const existingShipment = await this.prisma.shipment.findUnique({
            where: { vendorOrderId },
        });

        if (existingShipment) {
            throw new BadRequestException('Shipment already exists for this order');
        }

        const shipment = await this.prisma.shipment.create({
            data: {
                ...dto,
                vendorOrderId,
                status: 'SHIPPED',
            },
        });

        // Autoupdate order status
        await this.updateVendorOrderStatus(vendorOrderId, vendorId, 'SHIPPED');

        return shipment;
    }

    async updateTracking(vendorOrderId: string, vendorId: string, dto: any) {
        const vendorOrder = await this.prisma.vendorOrder.findUnique({
            where: { id: vendorOrderId },
        });

        if (!vendorOrder || vendorOrder.vendorId !== vendorId) {
            throw new NotFoundException('Vendor order not found or unauthorized');
        }

        const shipment = await this.prisma.shipment.findUnique({
            where: { vendorOrderId },
        });

        if (!shipment) {
            throw new NotFoundException('Shipment not found');
        }

        return this.prisma.shipment.update({
            where: { vendorOrderId },
            data: dto,
        });
    }

    async getTracking(orderId: string, userId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                vendorOrders: {
                    include: { shipment: true },
                },
            },
        });

        if (!order || order.userId !== userId) {
            throw new NotFoundException('Order not found or unauthorized');
        }

        return order.vendorOrders.map((vo: any) => ({
            vendorOrderId: vo.id,
            shipment: vo.shipment,
        }));
    }
}
