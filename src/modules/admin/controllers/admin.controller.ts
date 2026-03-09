import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, CurrentUser } from '../../../common/decorators';
import { Role } from '../../../common/constants';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { PayoutService } from '../../payouts/services/payout.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';

class ApproveVendorDto {
    @IsBoolean()
    @IsNotEmpty()
    approved!: boolean;
}

class ProcessPayoutDto {
    @IsBoolean()
    @IsNotEmpty()
    approved!: boolean;
}

class ToggleCooldownDto {
    @IsBoolean()
    @IsNotEmpty()
    enabled!: boolean;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly payoutService: PayoutService,
    ) { }

    @Get('vendors')
    async getVendors(@Query('status') status?: string) {
        return this.adminService.getAllVendors(status);
    }

    @Patch('vendors/:id/approve')
    async approveVendor(
        @Param('id') id: string,
        @Body() dto: ApproveVendorDto,
    ) {
        return this.adminService.approveVendor(id, dto.approved);
    }

    @Get('orders')
    async getAllOrders(@Query() query: PaginationDto) {
        return this.adminService.getAllOrders(query);
    }

    @Get('analytics')
    async getAnalytics() {
        return this.adminService.getAnalytics();
    }

    @Get('payouts')
    async getPayoutRequests() {
        return this.adminService.getAllPayoutRequests();
    }

    @Patch('payouts/:id')
    async processPayout(
        @Param('id') id: string,
        @Body() dto: ProcessPayoutDto,
    ) {
        return this.payoutService.processPayoutRequest(id, dto.approved);
    }

    @Patch('system/cooldown')
    async toggleCooldown(
        @Body() dto: ToggleCooldownDto,
        @CurrentUser('id') adminId: string,
    ) {
        return this.adminService.toggleCooldown(dto.enabled, adminId);
    }
}
