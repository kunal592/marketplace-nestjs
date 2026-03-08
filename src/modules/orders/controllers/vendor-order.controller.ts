import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, CurrentUser } from '../../../common/decorators';
import { Role } from '../../../common/constants';
import { IsNotEmpty, IsString } from 'class-validator';

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
    ) {
        return this.orderService.getVendorOrders(user.vendor.id);
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @CurrentUser() user: { vendor: { id: string } },
        @Body() dto: UpdateVendorOrderStatusDto,
    ) {
        return this.orderService.updateVendorOrderStatus(id, user.vendor.id, dto.status);
    }
}
