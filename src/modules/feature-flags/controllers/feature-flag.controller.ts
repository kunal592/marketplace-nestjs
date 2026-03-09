import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { FeatureFlagService } from '../services/feature-flag.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';
import { Role } from '../../../common/constants';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateFlagDto {
    @IsBoolean()
    @IsNotEmpty()
    enabled!: boolean;
}

@Controller()
export class FeatureFlagController {
    constructor(private readonly featureFlagService: FeatureFlagService) { }

    @Get('features')
    async getPublicFlags() {
        return this.featureFlagService.getAllFlags();
    }

    @Patch('admin/features/:key')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async updateFlag(
        @Param('key') key: string,
        @Body() dto: UpdateFlagDto,
    ) {
        return this.featureFlagService.updateFlag(key, dto.enabled);
    }
}
