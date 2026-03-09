import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    async getVendorAnalytics(vendorId: string) {
        // Confirm vendor exists
        const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });
        if (!vendor) throw new NotFoundException('Vendor profile not found');

        // 1. Total orders count
        const ordersCount = await this.prisma.vendorOrder.count({
            where: { vendorId }
        });

        // 2. Total revenue (sum of non-cancelled vendor orders)
        const revenueResult = await this.prisma.vendorOrder.aggregate({
            where: { vendorId, status: { not: 'CANCELLED' } },
            _sum: { vendorAmount: true }
        });
        const totalRevenue = revenueResult._sum.vendorAmount || 0;

        // 3. Top selling products
        // Prisma group by for top selling products
        const topProductsQuery = await this.prisma.orderItem.groupBy({
            by: ['productId'],
            where: {
                product: { vendorId }
            },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });

        const productIds = topProductsQuery.map((tp: any) => tp.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, price: true }
        });

        const topProducts = topProductsQuery.map((tp: any) => {
            const product = products.find((p: any) => p.id === tp.productId);
            return {
                id: tp.productId,
                name: product?.name || 'Unknown',
                price: product?.price || 0,
                soldQuantity: tp._sum.quantity || 0
            };
        });

        // 4. Monthly Revenue (Current year or all time, done in memory for simplicity)
        const orders = await this.prisma.vendorOrder.findMany({
            where: { vendorId, status: { not: 'CANCELLED' } },
            select: { vendorAmount: true, createdAt: true }
        });

        const monthlyRevenueMap: Record<string, number> = {};
        for (const order of orders) {
            const month = order.createdAt.toISOString().slice(0, 7); // e.g., "2026-03"
            monthlyRevenueMap[month] = (monthlyRevenueMap[month] || 0) + (order.vendorAmount || 0);
        }

        const monthlyRevenue = Object.entries(monthlyRevenueMap)
            .map(([month, revenue]) => ({ month, revenue }))
            .sort((a, b) => a.month.localeCompare(b.month)); // Sort chronologically

        // 5. Conversion rate (Mocked as we don't track page views yet)
        const conversionRate = 3.5; // Example: 3.5%

        return {
            totalRevenue,
            ordersCount,
            monthlyRevenue,
            topProducts,
            conversionRate
        };
    }
}
