import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { buildPaginatedResult, getPaginationOffset } from '../../../utils/pagination.util';

@Injectable()
export class AdsService {
    private readonly logger = new Logger(AdsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async createAd(vendorId: string, productId: string, budget: number, bidAmount: number, endDate: Date) {
        // Confirm product existence and ownership
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product) throw new NotFoundException('Product not found');
        if (product.vendorId !== vendorId) throw new ForbiddenException('You can only promote your own products');

        // Check wallet balance
        const wallet = await this.prisma.vendorWallet.findUnique({ where: { vendorId } });
        if (!wallet || wallet.balance < budget) {
            throw new BadRequestException('Insufficient balance to fund this campaign budget');
        }

        const [campaign] = await this.prisma.$transaction([
            this.prisma.adCampaign.create({
                data: {
                    vendorId,
                    productId,
                    budget,
                    bidAmount,
                    endDate: new Date(endDate),
                },
            }),
            this.prisma.vendorWallet.update({
                where: { vendorId },
                data: { balance: { decrement: budget } }
            })
        ]);

        this.logger.log(`Ad campaign created for product ${productId} by vendor ${vendorId}. Budget: ${budget}`);
        return campaign;
    }

    async getVendorAds(vendorId: string, query: PaginationDto) {
        const { skip, take } = getPaginationOffset(query.page || 1, query.limit || 10);

        const [data, total] = await this.prisma.$transaction([
            this.prisma.adCampaign.findMany({
                where: { vendorId },
                include: { product: { select: { name: true, price: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            this.prisma.adCampaign.count({ where: { vendorId } })
        ]);

        return buildPaginatedResult(data, total, query.page || 1, query.limit || 10);
    }

    async updateAdStatus(adId: string, vendorId: string, status: any) {
        const ad = await this.prisma.adCampaign.findUnique({ where: { id: adId } });
        if (!ad) throw new NotFoundException('Ad campaign not found');
        if (ad.vendorId !== vendorId) throw new ForbiddenException('Access denied');

        return this.prisma.adCampaign.update({
            where: { id: adId },
            data: { status }
        });
    }

    async getAllAdsAdmin(query: PaginationDto) {
        const { skip, take } = getPaginationOffset(query.page || 1, query.limit || 10);

        const [data, total] = await this.prisma.$transaction([
            this.prisma.adCampaign.findMany({
                include: {
                    product: { select: { name: true } },
                    vendor: { select: { storeName: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip, take,
            }),
            this.prisma.adCampaign.count()
        ]);

        return buildPaginatedResult(data, total, query.page || 1, query.limit || 10);
    }

    // Public method to retrieve top ad placements for listings
    async getActiveAds(takeLimit: number = 5) {
        // Return active campaigns prioritized by highest bid
        return this.prisma.adCampaign.findMany({
            where: {
                status: 'ACTIVE',
                endDate: { gt: new Date() }
            },
            include: {
                product: {
                    include: {
                        category: { select: { id: true, name: true, slug: true } },
                        vendor: { select: { id: true, storeName: true, storeLogo: true } }
                    }
                }
            },
            orderBy: { bidAmount: 'desc' },
            take: takeLimit
        });
    }
}
