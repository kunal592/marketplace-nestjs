import {
    Controller, Get, Post, Patch, Param, Body, UseGuards,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, CurrentUser } from '../../../common/decorators';
import { Role } from '../../../common/constants';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post()
    async createOrder(@CurrentUser('id') userId: string) {
        return this.orderService.createOrder(userId);
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
}
