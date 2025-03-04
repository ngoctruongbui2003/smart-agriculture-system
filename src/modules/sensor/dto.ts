import { PartialType } from "@nestjs/mapped-types";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateSensorDto {
    @IsString()
    humidity: string;

    @IsString()
    temperature: string;

    @IsString()
    light: string;

    @IsString()
    soilMoisture: string;

    @IsString()
    rainVolume: string;

    @IsString()
    gasVolume: string;

    @IsString()
    fieldId: string;
}

export class PaginationDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    sort?: string;
}
