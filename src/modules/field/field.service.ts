// field.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Field, FieldDocument } from 'src/schemas/field.schema';
import { CreateFieldDto } from './dto';

@Injectable()
export class FieldService {
    constructor(
        @InjectModel(Field.name) private fieldModel: Model<FieldDocument>,
    ) {}

    // Create a new field
    async create(createFieldDto: CreateFieldDto): Promise<Field> {
        const newField = new this.fieldModel(createFieldDto);
        return newField.save();
    }

    // Get all fields
    async findAll(): Promise<Field[]> {
        return this.fieldModel.find().exec();
    }

    // Get a specific field by ID
    async findOne(id: string): Promise<Field> {
        return this.fieldModel.findById(id).exec();
    }

    // Update a specific field by ID
    async update(id: string, updateFieldDto: CreateFieldDto): Promise<Field> {
        return this.fieldModel.findByIdAndUpdate(id, updateFieldDto, { new: true }).exec();
    }

    // Delete a field by ID
    async remove(id: string): Promise<Field> {
        return this.fieldModel.findByIdAndDelete(id).exec();
    }
}
