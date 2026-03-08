import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { VendorStatus } from '@prisma/client';

@Injectable()
export class VendorRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByUserId(userId: string) {
        return this.prisma.vendor.findUnique({
            where: { userId },
            include: {
                wallet: true,
            },
        });
    }

    async findById(id: string) {
        return this.prisma.vendor.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                wallet: true,
            },
        });
    }

    async findAll(status?: VendorStatus) {
        return this.prisma.vendor.findMany({
            where: status ? { status } : undefined,
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(data: {
        userId: string;
        storeName: string;
        storeSlug: string;
        description?: string;
        storeLogo?: string;
    }) {
        return this.prisma.vendor.create({
            data: {
                userId: data.userId,
                storeName: data.storeName,
                storeSlug: data.storeSlug,
                description: data.description,
                storeLogo: data.storeLogo,
                wallet: {
                    create: {},
                },
            },
            include: {
                wallet: true,
            },
        });
    }

    async update(id: string, data: { storeName?: string; storeSlug?: string; description?: string; storeLogo?: string }) {
        return this.prisma.vendor.update({
            where: { id },
            data,
        });
    }

    async updateStatus(id: string, status: VendorStatus) {
        return this.prisma.vendor.update({
            where: { id },
            data: { status },
        });
    }
}
