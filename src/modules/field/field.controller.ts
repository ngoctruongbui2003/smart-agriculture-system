// field.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { FieldService } from './field.service';
import { CreateFieldDto } from './dto';

@Controller('fields')
export class FieldController {
    constructor(private readonly fieldService: FieldService) {}

    @Post()
    async create(@Body() createFieldDto: CreateFieldDto) {
        return {
            message: 'Field created successfully',
            data: await this.fieldService.create(createFieldDto),
        };
    }

    @Get()
    async findAll() {
        return {
            message: 'Fields fetched successfully',
            data: await this.fieldService.findAll(),
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return {
            message: 'Field fetched successfully',
            data: await this.fieldService.findOne(id),
        };
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateFieldDto: CreateFieldDto,
    ) {
        return {
            message: 'Field updated successfully',
            data: await this.fieldService.update(id, updateFieldDto),
        };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return {
            message: 'Field deleted successfully',
            data: await this.fieldService.remove(id),
        };
    }
}
