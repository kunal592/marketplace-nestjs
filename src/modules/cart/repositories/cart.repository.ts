import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class CartRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findOrCreateCart(userId: string) {
        let cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true, name: true, slug: true, price: true,
                                discountPrice: true, images: true, stock: true,
                                vendor: { select: { id: true, storeName: true } },
                            },
                        },
                        variant: true,
                    },
                },
            },
        });

        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true, name: true, slug: true, price: true,
                                    discountPrice: true, images: true, stock: true,
                                    vendor: { select: { id: true, storeName: true } },
                                },
                            },
                            variant: true,
                        },
                    },
                },
            });
        }

        return cart;
    }

    async findCartItem(cartId: string, productId: string, variantId: string | null) {
        return this.prisma.cartItem.findFirst({
            where: {
                cartId,
                productId,
                variantId: variantId || null,
            },
        });
    }

    async addItem(cartId: string, productId: string, variantId: string | undefined, quantity: number) {
        return this.prisma.cartItem.create({
            data: {
                cartId,
                productId,
                variantId: variantId || null,
                quantity,
            },
            include: {
                product: {
                    select: { id: true, name: true, price: true, discountPrice: true },
                },
                variant: true,
            },
        });
    }

    async updateItemQuantity(id: string, quantity: number) {
        return this.prisma.cartItem.update({
            where: { id },
            data: { quantity },
        });
    }

    async removeItem(id: string) {
        return this.prisma.cartItem.delete({ where: { id } });
    }

    async clearCart(cartId: string) {
        return this.prisma.cartItem.deleteMany({ where: { cartId } });
    }
}
