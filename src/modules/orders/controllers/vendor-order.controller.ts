import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, CurrentUser } from '../../../common/decorators';
import { Role } from '../../../common/constants';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateShipmentDto, UpdateTrackingDto } from '../dto/shipment.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

class UpdateVendorOrderStatusDto {
    @IsString()
    @IsNotEmpty()
    status!: string;
}

@Controller('vendor-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
export class VendorOrderController {
    constructor(private readonly orderService: OrderService) { }

    @Get()
    async getVendorOrders(
        @CurrentUser() user: { vendor: { id: string } },
        @Query() query: PaginationDto,
    ) {
        return this.orderService.getVendorOrders(user.vendor.id, query);
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @CurrentUser() user: { vendor: { id: string } },
        @Body() dto: UpdateVendorOrderStatusDto,
    ) {
        return this.orderService.updateVendorOrderStatus(id, user.vendor.id, dto.status);
    }

    @Post(':id/ship')
    async shipOrder(
        @Param('id') id: string,
        @CurrentUser() user: { vendor: { id: string } },
        @Body() dto: CreateShipmentDto,
    ) {
        return this.orderService.createShipment(id, user.vendor.id, dto);
    }

    @Patch(':id/tracking')
    async updateTracking(
        @Param('id') id: string,
        @CurrentUser() user: { vendor: { id: string } },
        @Body() dto: UpdateTrackingDto,
    ) {
        return this.orderService.updateTracking(id, user.vendor.id, dto);
    }
}
