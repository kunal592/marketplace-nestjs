import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class RegisterVendorDto {
    @IsString()
    @IsNotEmpty()
    storeName!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    storeLogo?: string;
}
