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

@Injectable()
export class OrderService {
    private readonly logger = new Logger(OrderService.name);

    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) { }

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

        const order = await this.orderRepository.createOrder(
            userId,
            cart.id,
            cart.items,
            commissionPercent,
            address,
            coupon,
        );

        this.logger.log(`Order created: ${order?.id} by user ${userId}`);

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

    async getMyOrders(userId: string) {
        return this.orderRepository.findByUserId(userId);
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

    async getVendorOrders(vendorId: string) {
        return this.orderRepository.findVendorOrders(vendorId);
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
