import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ReviewService } from '../services/review.service';
import { CreateReviewDto } from '../dto/review.dto';
import { JwtAuthGuard } from '../../../common/guards';
import { CurrentUser } from '../../../common/decorators';

@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateReviewDto,
    ) {
        return this.reviewService.createReview(userId, dto);
    }

    @Get('product/:productId')
    async getProductReviews(@Param('productId') productId: string) {
        return this.reviewService.getProductReviews(productId);
    }
}
