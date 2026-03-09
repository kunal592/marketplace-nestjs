import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { VendorStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { buildPaginatedResult, getPaginationOffset } from '../../../utils/pagination.util';

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);

    constructor(private readonly prisma: PrismaService) { }

    async getAllVendors(status?: string) {
        const where = status ? { status: status as VendorStatus } : undefined;

        return this.prisma.vendor.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } },
                _count: { select: { products: true, vendorOrders: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async approveVendor(vendorId: string, approved: boolean) {
        const status = approved ? VendorStatus.APPROVED : VendorStatus.REJECTED;

        const vendor = await this.prisma.vendor.update({
            where: { id: vendorId },
            data: { status },
            include: {
                user: { select: { name: true, email: true } },
            },
        });

        this.logger.log(
            `Vendor ${vendor.storeName} (${vendorId}) ${approved ? 'approved' : 'rejected'}`,
        );

        return vendor;
    }

    async getAllOrders(query: PaginationDto) {
        const { skip, take } = getPaginationOffset(query.page || 1, query.limit || 10);
        let orderBy: any = { createdAt: 'desc' }; // default newest
        if (query.sort === 'price_asc') {
            orderBy = { totalAmount: 'asc' };
        } else if (query.sort === 'price_desc') {
            orderBy = { totalAmount: 'desc' };
        } else if (query.sort === 'newest') {
            orderBy = { createdAt: 'desc' };
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    vendorOrders: {
                        include: {
                            vendor: { select: { id: true, storeName: true } },
                        },
                    },
                    payment: true,
                },
                orderBy,
                skip,
                take,
            }),
            this.prisma.order.count(),
        ]);

        return buildPaginatedResult(data, total, query.page || 1, query.limit || 10);
    }

    async getAnalytics() {
        const [
            totalUsers,
            totalVendors,
            totalProducts,
            totalOrders,
            totalRevenue,
            pendingVendors,
            recentOrders,
        ] = await this.prisma.$transaction([
            this.prisma.user.count(),
            this.prisma.vendor.count({ where: { status: 'APPROVED' } }),
            this.prisma.product.count({ where: { status: 'ACTIVE' } }),
            this.prisma.order.count(),
            this.prisma.order.aggregate({
                where: { paymentStatus: 'PAID' },
                _sum: { totalAmount: true },
            }),
            this.prisma.vendor.count({ where: { status: 'PENDING' } }),
            this.prisma.order.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true } },
                    payment: { select: { status: true } },
                },
            }),
        ]);

        // Calculate total commission
        const commissionData = await this.prisma.vendorOrder.aggregate({
            _sum: { commission: true },
        });

        return {
            totalUsers,
            totalVendors,
            totalProducts,
            totalOrders,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            totalCommission: commissionData._sum.commission || 0,
            pendingVendors,
            recentOrders,
        };
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

    async toggleCooldown(enabled: boolean, adminId: string) {
        let config = await this.prisma.systemConfig.findFirst();

        if (!config) {
            config = await this.prisma.systemConfig.create({
                data: { cooldownEnabled: enabled, updatedBy: adminId },
            });
            this.logger.log(`Admin ${adminId} created system config. Cooldown set to ${enabled}`);
        } else {
            const previousState = config.cooldownEnabled;
            config = await this.prisma.systemConfig.update({
                where: { id: config.id },
                data: { cooldownEnabled: enabled, updatedBy: adminId },
            });
            this.logger.log(`Admin ${adminId} changed cooldown from ${previousState} to ${enabled}`);
        }

        return { cooldownEnabled: config.cooldownEnabled };
    }

    async getCooldownStatus() {
        const config = await this.prisma.systemConfig.findFirst();
        return { cooldownEnabled: config?.cooldownEnabled ?? false };
    }
}
