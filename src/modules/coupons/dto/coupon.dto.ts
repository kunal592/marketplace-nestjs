import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { DiscountType } from '@prisma/client';

export class CreateCouponDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsEnum(DiscountType)
    @IsNotEmpty()
    discountType: DiscountType;

    @IsNumber()
    @IsNotEmpty()
    discountValue: number;

    @IsNumber()
    @IsOptional()
    minOrderAmount?: number;

    @IsNumber()
    @IsOptional()
    maxDiscount?: number;

    @IsNumber()
    @IsOptional()
    usageLimit?: number;

    @IsDateString()
    @IsNotEmpty()
    expiresAt: string;
}

export class UpdateCouponDto {
    @IsOptional()
    @IsEnum(DiscountType)
    discountType?: DiscountType;

    @IsOptional()
    @IsNumber()
    discountValue?: number;

    @IsOptional()
    @IsNumber()
    minOrderAmount?: number;

    @IsOptional()
    @IsNumber()
    maxDiscount?: number;

    @IsOptional()
    @IsNumber()
    usageLimit?: number;

    @IsOptional()
    @IsDateString()
    expiresAt?: string;
}
