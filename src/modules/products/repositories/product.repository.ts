import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.ProductWhereInput;
        orderBy?: Prisma.ProductOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;

        const [data, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                skip,
                take,
                where,
                orderBy,
                include: {
                    vendor: { select: { id: true, storeName: true, storeSlug: true } },
                    category: { select: { id: true, name: true, slug: true } },
                    variants: true,
                    _count: { select: { reviews: true } },
                },
            }),
            this.prisma.product.count({ where }),
        ]);

        return { data, total };
    }

    async findById(id: string) {
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                vendor: { select: { id: true, storeName: true, storeSlug: true, userId: true } },
                category: { select: { id: true, name: true, slug: true } },
                variants: true,
                reviews: {
                    include: { user: { select: { id: true, name: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                _count: { select: { reviews: true } },
            },
        });
    }

    async findBySlug(slug: string) {
        return this.prisma.product.findUnique({
            where: { slug },
            include: {
                vendor: { select: { id: true, storeName: true, storeSlug: true, userId: true } },
                category: { select: { id: true, name: true, slug: true } },
                variants: true,
                reviews: {
                    include: { user: { select: { id: true, name: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                _count: { select: { reviews: true } },
            },
        });
    }

    async create(data: Prisma.ProductCreateInput) {
        return this.prisma.product.create({
            data,
            include: {
                vendor: { select: { id: true, storeName: true } },
                category: { select: { id: true, name: true } },
                variants: true,
            },
        });
    }

    async update(id: string, data: Prisma.ProductUpdateInput) {
        return this.prisma.product.update({
            where: { id },
            data,
            include: {
                variants: true,
                category: { select: { id: true, name: true } },
            },
        });
    }

    async delete(id: string) {
        return this.prisma.product.delete({ where: { id } });
    }
}
