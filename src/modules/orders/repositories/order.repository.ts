import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ConfigService } from '@nestjs/config';

interface CartItemForOrder {
    product: {
        id: string;
        price: number;
        discountPrice: number | null;
        vendorId: string;
    };
    variant: {
        price: number;
    } | null;
    quantity: number;
}

@Injectable()
export class OrderRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByUserId(userId: string) {
        return this.prisma.order.findMany({
            where: { userId },
            include: {
                vendorOrders: {
                    include: {
                        vendor: { select: { id: true, storeName: true } },
                    },
                },
                payment: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        return this.prisma.order.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                vendorOrders: {
                    include: {
                        vendor: { select: { id: true, storeName: true } },
                    },
                },
                payment: true,
            },
        });
    }

    async findVendorOrders(vendorId: string) {
        return this.prisma.vendorOrder.findMany({
            where: { vendorId },
            include: {
                order: {
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                        payment: { select: { status: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findAllOrders() {
        return this.prisma.order.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                vendorOrders: {
                    include: {
                        vendor: { select: { id: true, storeName: true } },
                    },
                },
                payment: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Creates the complete order structure in a single transaction:
     * - Order (parent)
     * - VendorOrders (one per vendor)
     * - Payment record
     * - Clear the cart
     * - Update vendor pending balances
     */
    async createOrder(
        userId: string,
        cartId: string,
        items: CartItemForOrder[],
        commissionPercent: number,
    ) {
        return this.prisma.$transaction(async (tx) => {
            // Group items by vendor
            const vendorGroups = new Map<string, { items: CartItemForOrder[]; total: number }>();

            for (const item of items) {
                const price = item.variant?.price ?? item.product.discountPrice ?? item.product.price;
                const itemTotal = price * item.quantity;
                const vendorId = item.product.vendorId;

                if (!vendorGroups.has(vendorId)) {
                    vendorGroups.set(vendorId, { items: [], total: 0 });
                }

                const group = vendorGroups.get(vendorId)!;
                group.items.push(item);
                group.total += itemTotal;
            }

            // Calculate grand total
            let totalAmount = 0;
            for (const [, group] of vendorGroups) {
                totalAmount += group.total;
            }

            // Create order
            const order = await tx.order.create({
                data: {
                    userId,
                    totalAmount: Math.round(totalAmount * 100) / 100,
                },
            });

            // Create vendor orders + update wallets
            for (const [vendorId, group] of vendorGroups) {
                const commission = Math.round(group.total * (commissionPercent / 100) * 100) / 100;
                const vendorAmount = Math.round((group.total - commission) * 100) / 100;

                await tx.vendorOrder.create({
                    data: {
                        orderId: order.id,
                        vendorId,
                        vendorAmount,
                        commission,
                    },
                });

                // Update vendor pending balance
                await tx.vendorWallet.update({
                    where: { vendorId },
                    data: {
                        pendingBalance: { increment: vendorAmount },
                    },
                });
            }

            // Create payment record
            await tx.payment.create({
                data: {
                    orderId: order.id,
                    amount: totalAmount,
                },
            });

            // Clear cart
            await tx.cartItem.deleteMany({ where: { cartId } });

            return tx.order.findUnique({
                where: { id: order.id },
                include: {
                    vendorOrders: {
                        include: { vendor: { select: { id: true, storeName: true } } },
                    },
                    payment: true,
                },
            });
        });
    }

    async updateVendorOrderStatus(id: string, status: string) {
        return this.prisma.vendorOrder.update({
            where: { id },
            data: { status: status as any },
        });
    }
}
