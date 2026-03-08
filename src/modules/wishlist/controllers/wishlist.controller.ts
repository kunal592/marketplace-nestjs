import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { WishlistService } from '../services/wishlist.service';
import { CreateWishlistDto } from '../dto/wishlist.dto';
import { JwtAuthGuard } from '../../../common/guards';
import { CurrentUser } from '../../../common/decorators';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) { }

    @Get()
    async getWishlist(@CurrentUser('id') userId: string) {
        return this.wishlistService.getUserWishlist(userId);
    }

    @Post()
    async addToWishlist(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateWishlistDto,
    ) {
        return this.wishlistService.addToWishlist(userId, dto);
    }

    @Delete(':productId')
    async removeFromWishlist(
        @CurrentUser('id') userId: string,
        @Param('productId') productId: string,
    ) {
        return this.wishlistService.removeFromWishlist(userId, productId);
    }
}
