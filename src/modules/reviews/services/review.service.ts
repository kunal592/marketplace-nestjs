import {
    Injectable, ConflictException, NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateReviewDto } from '../dto/review.dto';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { buildPaginatedResult, getPaginationOffset } from '../../../utils/pagination.util';

@Injectable()
export class ReviewService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
    ) { }

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

        // Notify vendor
        const productVendor = await this.prisma.product.findUnique({
            where: { id: dto.productId },
            include: { vendor: true },
        });

        if (productVendor?.vendor?.userId) {
            await this.notificationsService.createNotification(
                productVendor.vendor.userId,
                'REVIEW_RECEIVED',
                'New Product Review',
                `Your product "${productVendor.name}" received a ${dto.rating}-star review.`,
            );
        }

        return review;
    }

    async getProductReviews(productId: string, query: PaginationDto) {
        const { skip, take } = getPaginationOffset(query.page || 1, query.limit || 10);

        // Sorting logic
        let orderBy: any = { createdAt: 'desc' }; // default newest
        if (query.sort === 'rating') {
            orderBy = { rating: 'desc' };
        } else if (query.sort === 'newest') {
            orderBy = { createdAt: 'desc' };
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.review.findMany({
                where: { productId },
                include: {
                    user: { select: { id: true, name: true } },
                },
                orderBy,
                skip,
                take,
            }),
            this.prisma.review.count({ where: { productId } }),
        ]);

        return buildPaginatedResult(data, total, query.page || 1, query.limit || 10);
    }
}
