import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Field, FieldDocument } from 'src/schemas/field.schema';
import { CreateFieldDto, UpdateFieldDto } from './dto';
import { convertObjectId } from 'src/utils';

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

    async findAll(): Promise<Field[]> {
        return await this.fieldModel.find().exec();
    }

    async findOne(id: string): Promise<Field> {
        return await this.fieldModel.findById(id).exec();
    }

    async findByUserId(userId: string): Promise<Field[]> {
        const userIdObject = convertObjectId(userId);
        return await this.fieldModel.find({ userId: userIdObject }).exec();
    }

    async update(id: string, updateFieldDto: UpdateFieldDto): Promise<Field> {
        return await this.fieldModel.findByIdAndUpdate(id, updateFieldDto, { new: true }).exec();
    }

    async remove(id: string): Promise<Field> {
        return await this.fieldModel.findByIdAndDelete(id).exec();
    }
}
