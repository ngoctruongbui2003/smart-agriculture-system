import { Injectable } from '@nestjs/common';
import { CreateSensorDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Sensor, SensorDocument } from 'src/schemas/sensor.schema';
import { Model } from 'mongoose';

@Injectable()
export class SensorService {
    constructor(
            @InjectModel(Sensor.name) private sensorModel: Model<SensorDocument>,
    ) {}

    async saveSensorData(createSensorDto: CreateSensorDto) {
        return await this.sensorModel.create(createSensorDto);
    }

    async create(createSensorDto: CreateSensorDto) {
        return await this.sensorModel.create(createSensorDto);
    }
}
