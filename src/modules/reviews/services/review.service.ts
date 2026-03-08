import {
    Injectable, ConflictException, NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateReviewDto } from '../dto/review.dto';

@Injectable()
export class ReviewService {
    constructor(private readonly prisma: PrismaService) { }

    async createReview(userId: string, dto: CreateReviewDto) {
        // Check if product exists
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        // Check if user already reviewed
        const existing = await this.prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId: dto.productId,
                },
            },
        });

        if (existing) {
            throw new ConflictException('You have already reviewed this product');
        }

        // Create review
        const review = await this.prisma.review.create({
            data: {
                userId,
                productId: dto.productId,
                rating: dto.rating,
                comment: dto.comment,
            },
            include: {
                user: { select: { id: true, name: true } },
            },
        });

        // Update average product rating
        const aggregation = await this.prisma.review.aggregate({
            where: { productId: dto.productId },
            _avg: { rating: true },
        });

        await this.prisma.product.update({
            where: { id: dto.productId },
            data: { rating: aggregation._avg.rating || 0 },
        });

        return review;
    }

    async getProductReviews(productId: string) {
        return this.prisma.review.findMany({
            where: { productId },
            include: {
                user: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
