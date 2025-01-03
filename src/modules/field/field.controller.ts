// field.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, Patch } from '@nestjs/common';
import { FieldService } from './field.service';
import { CreateFieldDto, UpdateFieldDto } from './dto';

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

    @Get('user/:userId')
    async findByUserId(@Param('userId') userId: string) {
        return {
            message: 'Field fetched successfully',
            data: await this.fieldService.findByUserId(userId),
        };
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateFieldDto: UpdateFieldDto,
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
