import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { buildPaginatedResult, getPaginationOffset } from '../../../utils/pagination.util';

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);

    constructor(private readonly prisma: PrismaService) { }

    async getAllVendors(status?: any) {
        const where = status ? { status: status as any } : undefined;

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
        const status = approved ? 'APPROVED' : 'REJECTED';

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

    async getAllProducts(query: PaginationDto) {
        const { skip, take } = getPaginationOffset(query.page || 1, query.limit || 10);
        let orderBy: any = { createdAt: 'desc' };

        // We can pass a sort value or default to newest
        const [data, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                include: {
                    vendor: { select: { id: true, storeName: true } },
                    category: { select: { name: true } }
                },
                orderBy,
                skip,
                take,
            }),
            this.prisma.product.count(),
        ]);

        return buildPaginatedResult(data, total, query.page || 1, query.limit || 10);
    }

    async approveProduct(productId: string) {
        const product = await this.prisma.product.update({
            where: { id: productId },
            data: { status: 'ACTIVE', rejectionReason: null },
        });
        this.logger.log(`Admin approved product: ${productId}`);
        return product;
    }

    async rejectProduct(productId: string, reason: string) {
        const product = await this.prisma.product.update({
            where: { id: productId },
            data: { status: 'REJECTED', rejectionReason: reason },
        });
        this.logger.log(`Admin rejected product: ${productId}. Reason: ${reason}`);
        return product;
    }

    async updateVendorStatus(vendorId: string, status: any) {
        const vendor = await this.prisma.vendor.update({
            where: { id: vendorId },
            data: { status },
        });
        this.logger.log(`Vendor ${vendorId} status updated to ${status}`);
        return vendor;
    }

    async verifyVendorKyc(vendorId: string, verify: boolean) {
        const kyc = await this.prisma.vendorKYC.findUnique({ where: { vendorId } });
        if (!kyc) throw new NotFoundException('Vendor KYC record not found');

        const status = verify ? 'VERIFIED' : 'REJECTED';
        const updatedKyc = await this.prisma.vendorKYC.update({
            where: { vendorId },
            data: { verificationStatus: status },
        });

        this.logger.log(`Vendor KYC for vendor ${vendorId} was marked as ${status}`);

        return updatedKyc;
    }
}
