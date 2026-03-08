import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { ShipmentStatus } from '@prisma/client';

export class CreateShipmentDto {
    @IsString()
    @IsNotEmpty()
    courier: string;

    @IsString()
    @IsOptional()
    trackingNumber?: string;

    @IsNumber()
    @IsOptional()
    shippingCost?: number;

    @IsDateString()
    @IsOptional()
    estimatedDelivery?: string;
}

export class UpdateTrackingDto {
    @IsString()
    @IsOptional()
    trackingNumber?: string;

    @IsEnum(ShipmentStatus)
    @IsOptional()
    status?: ShipmentStatus;
}
