import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateTaxRateDto, UpdateTaxRateDto } from '../dto/tax.dto';

@Injectable()
export class TaxService {
    private readonly logger = new Logger(TaxService.name);

    constructor(private readonly prisma: PrismaService) { }

    // ─── Tax Calculation ─────────────────────────────────────
    async calculateTax(subtotal: number, country: string, state?: string) {
        // Try to find a state-specific rate first, then fall back to country-level
        let taxRate = null;

        if (state) {
            taxRate = await this.prisma.taxRate.findUnique({
                where: {
                    country_state: { country, state },
                },
            });
        }

        // Fallback to country-level rate (state = null)
        if (!taxRate) {
            taxRate = await this.prisma.taxRate.findFirst({
                where: {
                    country,
                    state: null,
                    isActive: true,
                },
            });
        }

        if (!taxRate || !taxRate.isActive) {
            return {
                subtotal,
                taxPercentage: 0,
                taxAmount: 0,
                total: subtotal,
                taxLabel: 'No tax',
                note: `No active tax rate found for ${country}${state ? ` / ${state}` : ''}`,
            };
        }

        const taxAmount = Math.round(subtotal * (taxRate.taxPercentage / 100) * 100) / 100;
        const total = Math.round((subtotal + taxAmount) * 100) / 100;

        return {
            subtotal,
            taxPercentage: taxRate.taxPercentage,
            taxAmount,
            total,
            taxLabel: taxRate.label,
            taxRateId: taxRate.id,
        };
    }

    // ─── Get Tax Rate for Address ────────────────────────────
    async getTaxForAddress(addressId: string) {
        const address = await this.prisma.address.findUnique({
            where: { id: addressId },
        });

        if (!address) {
            throw new NotFoundException('Address not found');
        }

        return this.findTaxRate(address.country, address.state ?? undefined);
    }

    // ─── Find Tax Rate ───────────────────────────────────────
    async findTaxRate(country: string, state?: string) {
        // Try state-specific first
        if (state) {
            const stateRate = await this.prisma.taxRate.findUnique({
                where: {
                    country_state: { country, state },
                },
            });
            if (stateRate && stateRate.isActive) return stateRate;
        }

        // Fallback to country-level
        const countryRate = await this.prisma.taxRate.findFirst({
            where: {
                country,
                state: null,
                isActive: true,
            },
        });

        return countryRate;
    }

    // ─── Admin: CRUD Operations ──────────────────────────────
    async createTaxRate(dto: CreateTaxRateDto) {
        // Check for duplicate
        const existing = await this.prisma.taxRate.findFirst({
            where: {
                country: dto.country,
                state: dto.state ?? null,
            },
        });

        if (existing) {
            throw new BadRequestException(
                `Tax rate already exists for ${dto.country}${dto.state ? ` / ${dto.state}` : ''}. Use PATCH to update.`,
            );
        }

        const taxRate = await this.prisma.taxRate.create({
            data: {
                country: dto.country,
                state: dto.state ?? null,
                taxPercentage: dto.taxPercentage,
                label: dto.label ?? 'GST',
            },
        });

        this.logger.log(
            `Tax rate created: ${taxRate.id} — ${dto.country}/${dto.state ?? 'ALL'} @ ${dto.taxPercentage}%`,
        );

        return taxRate;
    }

    async updateTaxRate(id: string, dto: UpdateTaxRateDto) {
        const existing = await this.prisma.taxRate.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundException('Tax rate not found');
        }

        const updated = await this.prisma.taxRate.update({
            where: { id },
            data: dto,
        });

        this.logger.log(`Tax rate ${id} updated`);

        return updated;
    }

    async deleteTaxRate(id: string) {
        const existing = await this.prisma.taxRate.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundException('Tax rate not found');
        }

        await this.prisma.taxRate.delete({ where: { id } });

        this.logger.log(`Tax rate ${id} deleted`);

        return { message: 'Tax rate deleted successfully' };
    }

    async getAllTaxRates() {
        return this.prisma.taxRate.findMany({
            orderBy: [{ country: 'asc' }, { state: 'asc' }],
        });
    }
}
