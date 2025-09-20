import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateVehicleDto {
    @IsString()
    licensePlate: string;

    @IsString()
    model: string;

    @IsString()
    brand: string;

    @IsNumber()
    year: number;

    @IsString()
    customerId: string;
}

export class UpdateVehicleDto {
    @IsOptional()
    @IsString()
    licensePlate?: string;

    @IsOptional()
    @IsString()
    model?: string;

    @IsOptional()
    @IsString()
    brand?: string;

    @IsOptional()
    @IsNumber()
    year?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}