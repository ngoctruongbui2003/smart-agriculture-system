import { IsString } from "class-validator";

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
}