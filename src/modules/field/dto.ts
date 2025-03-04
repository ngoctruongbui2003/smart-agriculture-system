import { PartialType } from "@nestjs/mapped-types";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateFieldDto {
    @IsString()
    name: string;

    @IsString()
    status: string;

    @IsString()
    type: string;

    @IsString()
    area: string;

    @IsString()
    imageUrl: string;

    @IsString()
    plantingDate: string;

    @IsString()
    cropHealth: string;

    @IsString()
    haverstTime: string;

    @IsString()
    isWeather: string;

    @IsString()
    isAutoWatering: string;

    @IsString()
    userId: string;
}

export class UpdateFieldDto extends PartialType(CreateFieldDto) {}

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
