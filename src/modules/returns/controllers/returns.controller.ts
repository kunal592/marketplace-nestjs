import {
    Controller, Get, Post, Patch, Param, Body, UseGuards,
} from '@nestjs/common';
import { ReturnsService } from '../services/returns.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, CurrentUser } from '../../../common/decorators';
import { Role } from '../../../common/constants';
import { CreateReturnRequestDto, UpdateReturnStatusDto } from '../dto/return.dto';

// ─── Customer Returns Controller ─────────────────────────
@Controller('returns')
@UseGuards(JwtAuthGuard)
export class ReturnsController {
    constructor(private readonly returnsService: ReturnsService) { }

    @Post()
    async createReturn(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateReturnRequestDto,
    ) {
        return this.returnsService.createReturnRequest(userId, dto);
    }

    @Get('my')
    async getMyReturns(@CurrentUser('id') userId: string) {
        return this.returnsService.getMyReturns(userId);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.VENDOR, Role.ADMIN)
    async updateReturnStatus(
        @Param('id') id: string,
        @CurrentUser() user: { id: string; role: string; vendor?: { id: string } },
        @Body() dto: UpdateReturnStatusDto,
    ) {
        return this.returnsService.updateReturnStatus(id, dto, user);
    }
}

// ─── Vendor Returns Controller ───────────────────────────
@Controller('vendor-returns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
export class VendorReturnsController {
    constructor(private readonly returnsService: ReturnsService) { }

    @Get()
    async getVendorReturns(
        @CurrentUser() user: { vendor: { id: string } },
    ) {
        return this.returnsService.getVendorReturns(user.vendor.id);
    }
}
