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
        id: string;
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
                        items: true,
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
                        items: true,
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
                items: true,
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
                        items: true,
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
        address: any,
        coupon?: any,
        taxPercentage: number = 0,
    ) {
        return this.prisma.$transaction(async (tx: any) => {
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

            // Fetch shipping configs for all vendors in this order
            const vendorIds = Array.from(vendorGroups.keys());
            const vendorConfigs = await tx.vendorShippingConfig.findMany({
                where: { vendorId: { in: vendorIds } },
            });
            const shippingMap = new Map();
            for (const config of vendorConfigs) {
                shippingMap.set(config.vendorId, config);
            }

            // Calculate grand total, eligible total, and shipping
            let totalAmount = 0;
            let eligibleTotal = 0;
            let totalShippingCost = 0;

            for (const [vendorId, group] of vendorGroups) {
                // Determine shipping cost
                const config = shippingMap.get(vendorId);
                let shippingCost = config?.baseShippingFee || 0;

                // Add weight based shipping if needed (assuming quantity represents simple weight unit for now if perKgRate > 0)
                if (config && config.perKgRate > 0) {
                    const totalItems = group.items.reduce((acc, item) => acc + item.quantity, 0);
                    shippingCost += totalItems * config.perKgRate;
                }

                // Check free shipping threshold
                if (config && config.freeShippingThreshold && group.total >= config.freeShippingThreshold) {
                    shippingCost = 0;
                }

                (group as any).shippingCost = shippingCost; // Mutate group to store shipping cost

                totalAmount += group.total;
                totalShippingCost += shippingCost;

                if (coupon && (!coupon.vendorId || coupon.vendorId === vendorId)) {
                    eligibleTotal += group.total;
                }
            }

            // Apply coupon discount if any (on product total, not shipping)
            let discountAmount = 0;
            if (coupon && totalAmount >= coupon.minOrderAmount) {
                if (coupon.discountType === 'PERCENTAGE') {
                    discountAmount = eligibleTotal * (coupon.discountValue / 100);
                    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                        discountAmount = coupon.maxDiscount;
                    }
                } else {
                    discountAmount = coupon.discountValue;
                }
                discountAmount = Math.min(discountAmount, eligibleTotal);
            }

            // Calculate tax on (subtotal - discount) — tax does not apply to shipping
            const taxableAmount = Math.max(0, totalAmount - discountAmount);
            const taxAmount = Math.round(taxableAmount * (taxPercentage / 100) * 100) / 100;

            // Create order
            const finalTotal = Math.max(0, totalAmount - discountAmount) + taxAmount + totalShippingCost;
            const order = await tx.order.create({
                data: {
                    userId,
                    totalAmount: Math.round(finalTotal * 100) / 100,
                    taxAmount,
                    shippingAddressId: address.id,
                    shippingAddress: address as any,
                    couponId: coupon ? coupon.id : null,
                },
            });

            // If coupon was used natively hit the usage limit update count
            if (coupon) {
                await tx.coupon.update({
                    where: { id: coupon.id },
                    data: { usedCount: { increment: 1 } },
                });
            }

            // Create vendor orders + update wallets
            for (const [vendorId, group] of vendorGroups) {
                const vendorShippingCost = (group as any).shippingCost || 0;

                // Commission is only calculated against subtotal, excluding shipping
                const commission = Math.round(group.total * (commissionPercent / 100) * 100) / 100;
                // Vendor amount includes shipping cost since they fulfill it
                const vendorAmount = Math.round((group.total - commission + vendorShippingCost) * 100) / 100;

                const vendorOrder = await tx.vendorOrder.create({
                    data: {
                        orderId: order.id,
                        vendorId,
                        subtotal: Math.round(group.total * 100) / 100,
                        shippingCost: vendorShippingCost,
                        vendorAmount,
                        commission,
                        items: {
                            create: group.items.map((item) => {
                                const price = item.variant?.price ?? item.product.discountPrice ?? item.product.price;
                                return {
                                    productId: item.product.id,
                                    variantId: item.variant?.id,
                                    quantity: item.quantity,
                                    price: price,
                                    total: price * item.quantity,
                                };
                            }),
                        },
                    },
                });

                // Set estimated delivery dates for shipments directly mapped
                const config = shippingMap.get(vendorId);
                const estimatedDays = config?.estimatedDeliveryDays || 3;
                const estimatedDeliveryDate = new Date();
                estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + estimatedDays);

                await tx.shipment.create({
                    data: {
                        vendorOrderId: vendorOrder.id,
                        courier: 'TBD',
                        shippingCost: vendorShippingCost,
                        estimatedDelivery: estimatedDeliveryDate,
                        status: 'CREATED',
                    }
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
                    amount: Math.round(finalTotal * 100) / 100,
                },
            });

            // Clear cart
            await tx.cartItem.deleteMany({ where: { cartId } });

            return tx.order.findUnique({
                where: { id: order.id },
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
        });
    }

    async updateVendorOrderStatus(id: string, status: string) {
        return this.prisma.vendorOrder.update({
            where: { id },
            data: { status: status as any },
        });
    }
}
