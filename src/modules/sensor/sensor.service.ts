import { Injectable } from '@nestjs/common';
import { CreateSensorDto, PaginationDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Sensor, SensorDocument } from 'src/schemas/sensor.schema';
import { Model } from 'mongoose';
import { parseSortFields } from 'src/utils';

@Injectable()
export class SensorService {
    constructor(@InjectModel(Sensor.name) private sensorModel: Model<SensorDocument>) {}

    async create(createSensorDto: CreateSensorDto) {
        return await this.sensorModel.create(createSensorDto);
    }

    async findAll(paginationDto: PaginationDto) {
        const { page, limit, sort } = paginationDto;
        let sortCriteria;

        if (sort) {
        sortCriteria = parseSortFields(sort);
        }
        
        const sensors = await this.sensorModel
                    .find()
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .sort(sort && sortCriteria)
                    .lean();
        return {
            page: page && +page,
            limit: limit && +limit,
            total: await this.sensorModel.countDocuments(),
            data: sensors,
        };
    }

    async findOne(id: string) {
        return await this.sensorModel.findById(id);
    }

    async findByField(fieldId: string, paginationDto: PaginationDto) {
        const { page, limit, sort } = paginationDto;
        let sortCriteria;

        if (sort) {
        sortCriteria = parseSortFields(sort);
        }
        const sensors = await this.sensorModel
                    .find({ fieldId })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .sort(sort && sortCriteria)
                    .lean();
        return {
            page: page && +page,
            limit: limit && +limit,
            total: await this.sensorModel.countDocuments({ fieldId }),
            data: sensors,
        };
    }
}
