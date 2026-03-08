import {
    Injectable,
    ConflictException,
    NotFoundException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { VendorRepository } from '../repositories';
import { RegisterVendorDto, UpdateVendorDto } from '../dto';
import { generateSlug } from '../../../utils/slug.util';
import { Role } from '@prisma/client';

@Injectable()
export class VendorService {
    private readonly logger = new Logger(VendorService.name);

    constructor(
        private readonly vendorRepository: VendorRepository,
        private readonly prisma: PrismaService,
    ) { }

    async registerVendor(userId: string, dto: RegisterVendorDto) {
        // Check if user already has a vendor profile
        const existing = await this.vendorRepository.findByUserId(userId);
        if (existing) {
            throw new ConflictException('You already have a vendor profile');
        }

        // Generate unique slug
        const storeSlug = generateSlug(dto.storeName);

        // Check slug uniqueness
        const slugExists = await this.prisma.vendor.findUnique({
            where: { storeSlug },
        });

        const finalSlug = slugExists
            ? `${storeSlug}-${Math.random().toString(36).substring(2, 8)}`
            : storeSlug;

        // Create vendor + wallet and update user role
        const vendor = await this.prisma.$transaction(async (tx) => {
            // Update user role to VENDOR
            await tx.user.update({
                where: { id: userId },
                data: { role: Role.VENDOR },
            });

            // Create vendor with wallet
            return tx.vendor.create({
                data: {
                    userId,
                    storeName: dto.storeName,
                    storeSlug: finalSlug,
                    description: dto.description,
                    storeLogo: dto.storeLogo,
                    wallet: {
                        create: {},
                    },
                },
                include: { wallet: true },
            });
        });

        this.logger.log(`New vendor registered: ${dto.storeName} (${vendor.id})`);

        return vendor;
    }

    async getProfile(userId: string) {
        const vendor = await this.vendorRepository.findByUserId(userId);
        if (!vendor) {
            throw new NotFoundException('Vendor profile not found');
        }
        return vendor;
    }

    async updateProfile(userId: string, dto: UpdateVendorDto) {
        const vendor = await this.vendorRepository.findByUserId(userId);
        if (!vendor) {
            throw new NotFoundException('Vendor profile not found');
        }

        const updateData: Record<string, string> = {};

        if (dto.storeName) {
            updateData.storeName = dto.storeName;
            updateData.storeSlug = generateSlug(dto.storeName);
        }
        if (dto.description !== undefined) {
            updateData.description = dto.description;
        }
        if (dto.storeLogo !== undefined) {
            updateData.storeLogo = dto.storeLogo;
        }

        return this.vendorRepository.update(vendor.id, updateData);
    }
}
