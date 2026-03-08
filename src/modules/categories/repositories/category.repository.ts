import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class CategoryRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.category.findMany({
            include: {
                children: true,
                parent: true,
                _count: { select: { products: true } },
            },
            orderBy: { name: 'asc' },
        });
    }

    async findById(id: string) {
        return this.prisma.category.findUnique({
            where: { id },
            include: {
                children: true,
                parent: true,
                _count: { select: { products: true } },
            },
        });
    }

    async findBySlug(slug: string) {
        return this.prisma.category.findUnique({
            where: { slug },
            include: { children: true },
        });
    }

    async create(data: { name: string; slug: string; parentId?: string }) {
        return this.prisma.category.create({
            data,
            include: { parent: true, children: true },
        });
    }

    async update(id: string, data: { name?: string; slug?: string; parentId?: string }) {
        return this.prisma.category.update({
            where: { id },
            data,
            include: { parent: true, children: true },
        });
    }

    async delete(id: string) {
        return this.prisma.category.delete({ where: { id } });
    }
}
