import {
    Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { TaxService } from '../services/tax.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';
import { Role } from '../../../common/constants';
import { CalculateTaxDto, CreateTaxRateDto, UpdateTaxRateDto } from '../dto/tax.dto';

// ─── Public Tax Calculation ──────────────────────────────
@Controller('tax')
export class TaxController {
    constructor(private readonly taxService: TaxService) { }

    @Get('calculate')
    async calculateTax(@Query() query: CalculateTaxDto) {
        return this.taxService.calculateTax(
            query.subtotal,
            query.country,
            query.state,
        );
    }

    @Get('rates')
    async getAllTaxRates() {
        return this.taxService.getAllTaxRates();
    }
}

// ─── Admin Tax Rate Management ───────────────────────────
@Controller('admin/tax-rates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminTaxController {
    constructor(private readonly taxService: TaxService) { }

    @Get()
    async getAllTaxRates() {
        return this.taxService.getAllTaxRates();
    }

    @Post()
    async createTaxRate(@Body() dto: CreateTaxRateDto) {
        return this.taxService.createTaxRate(dto);
    }

    @Patch(':id')
    async updateTaxRate(
        @Param('id') id: string,
        @Body() dto: UpdateTaxRateDto,
    ) {
        return this.taxService.updateTaxRate(id, dto);
    }

    @Delete(':id')
    async deleteTaxRate(@Param('id') id: string) {
        return this.taxService.deleteTaxRate(id);
    }
}
