import {
    Controller, Get, Post, Patch, Param, Body, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, CurrentUser } from '../../../common/decorators';
import { Role } from '../../../common/constants';
import { IdempotencyInterceptor } from '../../../common/interceptors/idempotency.interceptor';
import { CreateOrderDto } from '../dto/order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post()
    @UseInterceptors(IdempotencyInterceptor)
    async createOrder(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateOrderDto,
    ) {
        return this.orderService.createOrder(userId, dto.shippingAddressId, dto.couponCode);
    }

    @Post('apply-coupon')
    async applyCoupon(
        @CurrentUser('id') userId: string,
        @Body() dto: { couponCode: string },
    ) {
        return this.orderService.applyCoupon(userId, dto.couponCode);
    }

    @Get('my')
    async getMyOrders(@CurrentUser('id') userId: string) {
        return this.orderService.getMyOrders(userId);
    }

    @Get(':id')
    async getOrderById(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.orderService.getOrderById(id, userId);
    }

    @Post(':id/cancel')
    async cancelOrder(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.orderService.cancelOrder(id, userId);
    }

    @Get(':id/tracking')
    async getTracking(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.orderService.getTracking(id, userId);
    }
}
