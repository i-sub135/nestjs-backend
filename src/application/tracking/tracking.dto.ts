import { IsString, IsNumber, IsOptional } from 'class-validator';

export class LocationUpdateDto {
    @IsString()
    vehicleId: string;

    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;

    @IsNumber()
    speed: number;

    @IsOptional()
    @IsString()
    sessionId?: string;
}