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

    async createOrder(userId: string, shippingAddressId: string) {
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

        const commissionPercent = this.configService.get<number>('platform.commissionPercent', 10);

        const order = await this.orderRepository.createOrder(
            userId,
            cart.id,
            cart.items,
            commissionPercent,
            address,
        );

        this.logger.log(`Order created: ${order?.id} by user ${userId}`);

        return order;
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
}
