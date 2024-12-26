import { IsString } from "class-validator";

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