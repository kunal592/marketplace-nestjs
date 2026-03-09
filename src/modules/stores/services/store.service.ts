import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { buildPaginatedResult, getPaginationOffset } from '../../../utils/pagination.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class StoreService {
    constructor(private readonly prisma: PrismaService) { }

    async getStoreBySlug(slug: string) {
        const store = await this.prisma.vendorStore.findUnique({
            where: { slug },
            include: {
                vendor: {
                    select: {
                        user: { select: { name: true, email: true } },
                        status: true,
                        rating: true,
                    },
                },
            },
        });

        if (!store) {
            // Fallback to checking vendor by storeSlug since store is 1:1,
            // or maybe the store record hasn't been explicitly created yet?
            // Optionally auto-generate from vendor:
            const vendor = await this.prisma.vendor.findUnique({
                where: { storeSlug: slug },
                include: { user: { select: { name: true, email: true } } },
            });

            if (!vendor) {
                throw new NotFoundException('Store not found');
            }

            // Mock response if the independent store record doesn't exist yet
            return {
                id: vendor.id,
                vendorId: vendor.id,
                storeName: vendor.storeName,
                slug: vendor.storeSlug,
                logo: vendor.storeLogo,
                banner: null,
                description: vendor.description,
                createdAt: vendor.createdAt,
                updatedAt: vendor.updatedAt,
                vendor: {
                    user: vendor.user,
                    status: vendor.status,
                    rating: vendor.rating,
                },
            };
        }

        return store;
    }

    async getStoreProducts(slug: string, query: PaginationDto) {
        // First get the store/vendor details
        const store = await this.getStoreBySlug(slug);
        const vendorId = store.vendorId;

        const { skip, take } = getPaginationOffset(query.page || 1, query.limit || 20);

        let orderBy: any = { createdAt: 'desc' };
        if (query.sort === 'price_asc') orderBy = { price: 'asc' };
        else if (query.sort === 'price_desc') orderBy = { price: 'desc' };
        else if (query.sort === 'rating') orderBy = { rating: 'desc' };

        const where: any = {
            vendorId,
            status: 'ACTIVE',
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                where,
                include: {
                    category: { select: { id: true, name: true, slug: true } },
                },
                orderBy,
                skip,
                take,
            }),
            this.prisma.product.count({ where }),
        ]);

        return buildPaginatedResult(data, total, query.page || 1, query.limit || 20);
    }
}
