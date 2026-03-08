import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateCouponDto, UpdateCouponDto } from '../dto/coupon.dto';

@Injectable()
export class CouponService {
    constructor(private readonly prisma: PrismaService) { }

    async createCoupon(userId: string, vendorId: string | null, dto: CreateCouponDto) {
        // Assume admin has null vendorId, vendors have their vendorId
        const existing = await this.prisma.coupon.findUnique({
            where: { code: dto.code },
        });

        if (existing) {
            throw new BadRequestException('Coupon code already exists');
        }

        return this.prisma.coupon.create({
            data: {
                ...dto,
                vendorId,
            },
        });
    }

    async getCoupons(vendorId: string | null) {
        if (vendorId) {
            return this.prisma.coupon.findMany({
                where: { vendorId },
                orderBy: { createdAt: 'desc' },
            });
        }
        return this.prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateCoupon(id: string, vendorId: string | null, dto: UpdateCouponDto) {
        const coupon = await this.prisma.coupon.findUnique({ where: { id } });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        if (vendorId && coupon.vendorId !== vendorId) {
            throw new ForbiddenException('You can only update your own coupons');
        }

        return this.prisma.coupon.update({
            where: { id },
            data: dto,
        });
    }

    async deleteCoupon(id: string, vendorId: string | null) {
        const coupon = await this.prisma.coupon.findUnique({ where: { id } });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        if (vendorId && coupon.vendorId !== vendorId) {
            throw new ForbiddenException('You can only delete your own coupons');
        }

        await this.prisma.coupon.delete({ where: { id } });

        return { message: 'Coupon deleted successfully' };
    }
}
