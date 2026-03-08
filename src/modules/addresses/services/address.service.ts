import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto';

@Injectable()
export class AddressService {
    constructor(private readonly prisma: PrismaService) { }

    async getUserAddresses(userId: string) {
        return this.prisma.address.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
    }

    async createAddress(userId: string, dto: CreateAddressDto) {
        if (dto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }

        // If it's the first address, make it default automatically
        const isFirst = await this.prisma.address.count({ where: { userId } }) === 0;

        return this.prisma.address.create({
            data: {
                ...dto,
                userId,
                isDefault: dto.isDefault || isFirst,
            },
        });
    }

    async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
        const address = await this.prisma.address.findUnique({
            where: { id: addressId },
        });

        if (!address || address.userId !== userId) {
            throw new NotFoundException('Address not found');
        }

        if (dto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId, id: { not: addressId } },
                data: { isDefault: false },
            });
        }

        return this.prisma.address.update({
            where: { id: addressId },
            data: dto,
        });
    }

    async deleteAddress(userId: string, addressId: string) {
        const address = await this.prisma.address.findUnique({
            where: { id: addressId },
        });

        if (!address || address.userId !== userId) {
            throw new NotFoundException('Address not found');
        }

        await this.prisma.address.delete({
            where: { id: addressId },
        });

        if (address.isDefault) {
            // Find another address and make it default
            const anotherAddress = await this.prisma.address.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });

            if (anotherAddress) {
                await this.prisma.address.update({
                    where: { id: anotherAddress.id },
                    data: { isDefault: true },
                });
            }
        }

        return { message: 'Address deleted successfully' };
    }
}
