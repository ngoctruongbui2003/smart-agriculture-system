import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Field, FieldDocument } from 'src/schemas/field.schema';
import { CreateFieldDto, PaginationDto, UpdateFieldDto } from './dto';
import { convertObjectId, parseSortFields } from 'src/utils';

@Injectable()
export class FieldService {
    constructor(
        @InjectModel(Field.name) private fieldModel: Model<FieldDocument>,
    ) {}

    async create(createFieldDto: CreateFieldDto): Promise<Field> {
        const userIdObject = convertObjectId(createFieldDto.userId);
        const newField = await this.fieldModel.create({
            ...createFieldDto,
            userId: userIdObject,
        });
        return newField.save();
    }

    async findAll(paginationDto: PaginationDto) {
        const { page, limit, sort } = paginationDto;
        let sortCriteria;
        if (sort) sortCriteria = parseSortFields(sort);

        const fields = await this.fieldModel
                    .find()
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .sort(sort && sortCriteria)
                    .lean();
        return {
            page: page && +page,
            limit: limit && +limit,
            total: await this.fieldModel.countDocuments(),
            data: fields,
        };
    }

    async findOne(id: string): Promise<Field> {
        return await this.fieldModel.findById(id).exec();
    }

    async findByUserId(userId: string, paginationDto: PaginationDto) {
        const { page, limit, sort } = paginationDto;
        let sortCriteria;
        if (sort) sortCriteria = parseSortFields(sort);

        const userIdObject = convertObjectId(userId);
        const fields = await this.fieldModel
                    .find({ userId: userIdObject })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .sort(sort && sortCriteria)
                    .lean();
        return {
            page: page && +page,
            limit: limit && +limit,
            total: await this.fieldModel.countDocuments({ userId: userIdObject }),
            data: fields,
        };
    }

    async switchWeather(id: string): Promise<Field> {
        const field = await this.fieldModel.findById(id).exec();
        field.isWeather = !field.isWeather;
        return await field.save();
    }

    async switchAutoWatering(id: string): Promise<Field> {
        const field = await this.fieldModel.findById(id).exec();
        field.isAutoWatering = !field.isAutoWatering;
        return await field.save();
    }

    async update(id: string, updateFieldDto: UpdateFieldDto): Promise<Field> {
        return await this.fieldModel.findByIdAndUpdate(id, updateFieldDto, { new: true }).exec();
    }

    async remove(id: string): Promise<Field> {
        return await this.fieldModel.findByIdAndDelete(id).exec();
    }
}
