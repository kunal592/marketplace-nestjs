import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class AddCartItemDto {
    @IsString()
    @IsNotEmpty()
    productId!: string;

    @IsString()
    @IsOptional()
    variantId?: string;

    @IsNumber()
    @Min(1)
    quantity!: number;
}

export class UpdateCartItemDto {
    @IsNumber()
    @Min(1)
    quantity!: number;
}
