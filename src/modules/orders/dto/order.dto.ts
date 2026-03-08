import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    shippingAddressId: string;

    @IsString()
    @IsOptional()
    couponCode?: string;
}

export class ApplyCouponDto {
    @IsString()
    @IsNotEmpty()
    couponCode: string;
}
