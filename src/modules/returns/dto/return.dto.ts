import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ReturnStatus } from '../../../common/constants';

export class CreateReturnRequestDto {
    @IsString()
    @IsNotEmpty()
    orderItemId: string;

    @IsString()
    @IsNotEmpty()
    reason: string;
}

export class UpdateReturnStatusDto {
    @IsEnum(ReturnStatus)
    @IsNotEmpty()
    status: ReturnStatus;

    @IsString()
    @IsOptional()
    adminNote?: string;
}
