import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CouponService } from '../services/coupon.service';
import { CreateCouponDto, UpdateCouponDto } from '../dto/coupon.dto';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, CurrentUser } from '../../../common/decorators';
import { Role } from '../../../common/constants';

@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CouponController {
    constructor(private readonly couponService: CouponService) { }

    @Post()
    @Roles(Role.ADMIN, Role.VENDOR)
    async createCoupon(
        @CurrentUser('id') userId: string,
        @CurrentUser('role') role: string,
        @CurrentUser('vendor') vendor: { id: string } | null,
        @Body() dto: CreateCouponDto,
    ) {
        // Only admins can create platform-wide coupons (vendorId = null).
        // Vendors must have their vendorId attached implicitly.
        const vendorId = role === Role.ADMIN ? null : vendor?.id || null;
        return this.couponService.createCoupon(userId, vendorId, dto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.VENDOR)
    async getCoupons(
        @CurrentUser('role') role: string,
        @CurrentUser('vendor') vendor: { id: string } | null,
    ) {
        const vendorId = role === Role.ADMIN ? null : vendor?.id || null;
        return this.couponService.getCoupons(vendorId);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.VENDOR)
    async updateCoupon(
        @Param('id') id: string,
        @CurrentUser('role') role: string,
        @CurrentUser('vendor') vendor: { id: string } | null,
        @Body() dto: UpdateCouponDto,
    ) {
        const vendorId = role === Role.ADMIN ? null : vendor?.id || null;
        return this.couponService.updateCoupon(id, vendorId, dto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.VENDOR)
    async deleteCoupon(
        @Param('id') id: string,
        @CurrentUser('role') role: string,
        @CurrentUser('vendor') vendor: { id: string } | null,
    ) {
        const vendorId = role === Role.ADMIN ? null : vendor?.id || null;
        return this.couponService.deleteCoupon(id, vendorId);
    }
}
