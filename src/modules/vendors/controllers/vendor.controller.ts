import { Controller, Post, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { VendorService } from '../services';
import { RegisterVendorDto, UpdateVendorDto } from '../dto';
import { JwtAuthGuard } from '../../../common/guards';
import { CurrentUser } from '../../../common/decorators';

@Controller('vendors')
@UseGuards(JwtAuthGuard)
export class VendorController {
    constructor(private readonly vendorService: VendorService) { }

    @Post('register')
    async register(
        @CurrentUser('id') userId: string,
        @Body() dto: RegisterVendorDto,
    ) {
        return this.vendorService.registerVendor(userId, dto);
    }

    @Get('profile')
    async getProfile(@CurrentUser('id') userId: string) {
        return this.vendorService.getProfile(userId);
    }

    @Patch('profile')
    async updateProfile(
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateVendorDto,
    ) {
        return this.vendorService.updateProfile(userId, dto);
    }
}
