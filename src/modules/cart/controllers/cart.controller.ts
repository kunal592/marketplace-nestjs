import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { AddCartItemDto, UpdateCartItemDto } from '../dto/cart.dto';
import { JwtAuthGuard } from '../../../common/guards';
import { CurrentUser } from '../../../common/decorators';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    async getCart(@CurrentUser('id') userId: string) {
        return this.cartService.getCart(userId);
    }

    @Post('items')
    async addItem(
        @CurrentUser('id') userId: string,
        @Body() dto: AddCartItemDto,
    ) {
        return this.cartService.addItem(userId, dto);
    }

    @Patch('items/:id')
    async updateItem(
        @CurrentUser('id') userId: string,
        @Param('id') itemId: string,
        @Body() dto: UpdateCartItemDto,
    ) {
        return this.cartService.updateItem(userId, itemId, dto);
    }

    @Delete('items/:id')
    async removeItem(
        @CurrentUser('id') userId: string,
        @Param('id') itemId: string,
    ) {
        return this.cartService.removeItem(userId, itemId);
    }
}
