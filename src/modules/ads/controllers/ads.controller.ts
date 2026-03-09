import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AdsService } from '../services/ads.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, CurrentUser } from '../../../common/decorators';
import { Role } from '../../../common/constants';
import { IsNumber, IsNotEmpty, IsDateString, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

class CreateAdDto {
    @IsString()
    @IsNotEmpty()
    productId!: string;

    @IsNumber()
    budget!: number;

    @IsNumber()
    bidAmount!: number;

    @IsDateString()
    endDate!: string;
}

class UpdateAdStatusDto {
    @IsString()
    @IsNotEmpty()
    status!: string;
}

@Controller()
export class AdsController {
    constructor(private readonly adsService: AdsService) { }

    @Get('public/ads')
    async getActiveAds(@Query('limit') limit?: number) {
        return this.adsService.getActiveAds(limit ? parseInt(limit.toString()) : 5);
    }

    // Vendor Endpoints
    @Post('ads')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.VENDOR)
    async createAd(
        @CurrentUser() user: { vendor: { id: string } },
        @Body() dto: CreateAdDto,
    ) {
        return this.adsService.createAd(user.vendor.id, dto.productId, dto.budget, dto.bidAmount, new Date(dto.endDate));
    }

    @Get('ads')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.VENDOR)
    async getVendorAds(
        @CurrentUser() user: { vendor: { id: string } },
        @Query() query: PaginationDto,
    ) {
        return this.adsService.getVendorAds(user.vendor.id, query);
    }

    @Patch('ads/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.VENDOR)
    async updateAdStatus(
        @Param('id') id: string,
        @CurrentUser() user: { vendor: { id: string } },
        @Body() dto: UpdateAdStatusDto,
    ) {
        return this.adsService.updateAdStatus(id, user.vendor.id, dto.status);
    }

    // Admin Endpoints
    @Get('admin/ads')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async getAllAdsAdmin(@Query() query: PaginationDto) {
        return this.adsService.getAllAdsAdmin(query);
    }
}
