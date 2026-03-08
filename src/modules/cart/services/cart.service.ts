import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CartRepository } from '../repositories/cart.repository';
import { AddCartItemDto, UpdateCartItemDto } from '../dto/cart.dto';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class CartService {
    constructor(
        private readonly cartRepository: CartRepository,
        private readonly prisma: PrismaService,
    ) { }

    async getCart(userId: string) {
        const cart = await this.cartRepository.findOrCreateCart(userId);

        // Calculate totals
        let totalAmount = 0;
        for (const item of cart.items) {
            const price = item.variant?.price ?? item.product.discountPrice ?? item.product.price;
            totalAmount += price * item.quantity;
        }

        return {
            ...cart,
            totalAmount: Math.round(totalAmount * 100) / 100,
            itemCount: cart.items.length,
        };
    }

    async addItem(userId: string, dto: AddCartItemDto) {
        // Verify product exists and is in stock
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (product.stock < dto.quantity) {
            throw new BadRequestException('Insufficient stock');
        }

        const cart = await this.cartRepository.findOrCreateCart(userId);

        // Check if item already in cart
        const existingItem = await this.cartRepository.findCartItem(
            cart.id, dto.productId, dto.variantId || null,
        );

        if (existingItem) {
            // Update quantity
            await this.cartRepository.updateItemQuantity(
                existingItem.id, existingItem.quantity + dto.quantity,
            );
        } else {
            await this.cartRepository.addItem(
                cart.id, dto.productId, dto.variantId, dto.quantity,
            );
        }

        return this.getCart(userId);
    }

    async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
        const cart = await this.cartRepository.findOrCreateCart(userId);
        const item = cart.items.find((i) => i.id === itemId);

        if (!item) {
            throw new NotFoundException('Cart item not found');
        }

        await this.cartRepository.updateItemQuantity(itemId, dto.quantity);
        return this.getCart(userId);
    }

    async removeItem(userId: string, itemId: string) {
        const cart = await this.cartRepository.findOrCreateCart(userId);
        const item = cart.items.find((i) => i.id === itemId);

        if (!item) {
            throw new NotFoundException('Cart item not found');
        }

        await this.cartRepository.removeItem(itemId);
        return this.getCart(userId);
    }
}
