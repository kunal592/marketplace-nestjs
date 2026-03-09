import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculateTaxDto {
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    subtotal: number;

    @IsString()
    @IsNotEmpty()
    country: string;

    @IsString()
    @IsOptional()
    state?: string;
}

export class CreateTaxRateDto {
    @IsString()
    @IsNotEmpty()
    country: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsNumber()
    @Min(0)
    @Max(100)
    @Type(() => Number)
    taxPercentage: number;

    @IsString()
    @IsOptional()
    label?: string;
}

export class UpdateTaxRateDto {
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    @Type(() => Number)
    taxPercentage?: number;

    @IsString()
    @IsOptional()
    label?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
