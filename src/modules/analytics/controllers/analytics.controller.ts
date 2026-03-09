import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, CurrentUser } from '../../../common/decorators';
import { Role } from '../../../common/constants';

@Controller('vendor/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get()
    async getAnalytics(@CurrentUser() user: { vendor: { id: string } }) {
        return this.analyticsService.getVendorAnalytics(user.vendor.id);
    }
}
