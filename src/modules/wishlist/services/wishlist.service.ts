import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateWishlistDto } from '../dto/wishlist.dto';

@Injectable()
export class WishlistService {
    constructor(private readonly prisma: PrismaService) { }

    async getUserWishlist(userId: string) {
        return this.prisma.wishlist.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        discountPrice: true,
                        images: true,
                        status: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async addToWishlist(userId: string, dto: CreateWishlistDto) {
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const existing = await this.prisma.wishlist.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId: dto.productId,
                },
            },
        });

        if (existing) {
            return { message: 'Product already in wishlist', wishlistId: existing.id };
        }

        return this.prisma.wishlist.create({
            data: {
                userId,
                productId: dto.productId,
            },
        });
    }

    async removeFromWishlist(userId: string, productId: string) {
        const item = await this.prisma.wishlist.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });

        if (!item) {
            throw new NotFoundException('Wishlist item not found');
        }

        await this.prisma.wishlist.delete({
            where: { id: item.id },
        });

        return { message: 'Product removed from wishlist' };
    }
}
