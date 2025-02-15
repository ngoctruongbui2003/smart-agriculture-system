import { PartialType } from "@nestjs/mapped-types";
import { Transform } from "class-transformer";
import { IsDate, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateWateringHistoryDto {
    @IsDate()
    @Transform(({ value }) => value ?? new Date(new Date().getTime() + 7 * 60 * 60 * 1000))
    startDate: Date;

    @IsDate()
    @Transform(({ value }) => value ?? new Date(new Date().getTime() + 7 * 60 * 60 * 1000))
    endDate: Date;

    @IsString()
    fieldId: string;
}

export class UpdateFieldDto extends PartialType(CreateWateringHistoryDto) {
    @IsOptional()
    isDeleted: boolean;
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
