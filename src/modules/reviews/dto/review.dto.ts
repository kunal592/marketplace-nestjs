import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateReviewDto {
    @IsString()
    @IsNotEmpty()
    productId!: string;

    @IsNumber()
    @Min(1)
    @Max(5)
    rating!: number;

    @IsString()
    @IsOptional()
    comment?: string;
}
