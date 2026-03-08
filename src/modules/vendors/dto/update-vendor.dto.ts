import { IsString, IsOptional } from 'class-validator';

export class UpdateVendorDto {
    @IsString()
    @IsOptional()
    storeName?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    storeLogo?: string;
}
