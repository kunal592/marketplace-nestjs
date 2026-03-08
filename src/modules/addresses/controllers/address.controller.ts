import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AddressService } from '../services/address.service';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto';
import { JwtAuthGuard } from '../../../common/guards';
import { CurrentUser } from '../../../common/decorators';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
    constructor(private readonly addressService: AddressService) { }

    @Get()
    async getMyAddresses(@CurrentUser('id') userId: string) {
        return this.addressService.getUserAddresses(userId);
    }

    @Post()
    async createAddress(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateAddressDto,
    ) {
        return this.addressService.createAddress(userId, dto);
    }

    @Patch(':id')
    async updateAddress(
        @CurrentUser('id') userId: string,
        @Param('id') addressId: string,
        @Body() dto: UpdateAddressDto,
    ) {
        return this.addressService.updateAddress(userId, addressId, dto);
    }

    @Delete(':id')
    async deleteAddress(
        @CurrentUser('id') userId: string,
        @Param('id') addressId: string,
    ) {
        return this.addressService.deleteAddress(userId, addressId);
    }
}
