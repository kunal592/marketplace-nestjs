import {
    IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, IsEnum,
    Min, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVariantDto {
    @IsString()
    @IsNotEmpty()
    sku!: string;

    @IsNumber()
    @Min(0)
    price!: number;

    @IsNumber()
    @Min(0)
    stock!: number;

    @IsOptional()
    attributes?: Record<string, string>;
}

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    categoryId!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    price!: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    discountPrice?: number;

    @IsNumber()
    @Min(0)
    stock!: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateVariantDto)
    @IsOptional()
    variants?: CreateVariantDto[];
}

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    categoryId?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    price?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    discountPrice?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    stock?: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?: string[];
}

export class ProductQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString()
    vendorId?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    limit?: number = 20;

    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc' = 'desc';

    @IsOptional()
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @IsOptional()
    @IsNumber()
    maxPrice?: number;
}
