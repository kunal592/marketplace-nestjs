import { Controller, Get, Post, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { PayoutService } from '../services/payout.service';
import { RequestPayoutDto } from '../dto/payout.dto';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, CurrentUser } from '../../../common/decorators';
import { Role } from '../../../common/constants';
import { IdempotencyInterceptor } from '../../../common/interceptors/idempotency.interceptor';

@Controller('payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
export class PayoutController {
    constructor(private readonly payoutService: PayoutService) { }

    @Post('request')
    @UseInterceptors(IdempotencyInterceptor)
    async requestPayout(
        @CurrentUser() user: { vendor: { id: string } },
        @Body() dto: RequestPayoutDto,
    ) {
        return this.payoutService.requestPayout(user.vendor.id, dto);
    }

    @Get()
    async getPayouts(@CurrentUser() user: { vendor: { id: string } }) {
        return this.payoutService.getVendorPayouts(user.vendor.id);
    }
}
