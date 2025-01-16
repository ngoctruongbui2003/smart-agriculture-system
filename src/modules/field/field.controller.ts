// field.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, Patch } from '@nestjs/common';
import { FieldService } from './field.service';
import { CreateFieldDto, PaginationDto, UpdateFieldDto } from './dto';

@Controller('fields')
export class FieldController {
    constructor(private readonly fieldService: FieldService) {}

    @Post('create')
    async create(@Body() createFieldDto: CreateFieldDto) {
        return {
            message: 'Field created successfully',
            data: await this.fieldService.create(createFieldDto),
        };
    }

    @Post()
    async findAll(@Body() paginationDto: PaginationDto,) {
        return {
            message: 'Fields fetched successfully',
            data: await this.fieldService.findAll(paginationDto),
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return {
            message: 'Field fetched successfully',
            data: await this.fieldService.findOne(id),
        };
    }

    @Post('user/:userId')
    async findByUserId(
        @Param('userId') userId: string,
        @Body() paginationDto: PaginationDto,
    ) {
        return {
            message: 'Field fetched successfully',
            data: await this.fieldService.findByUserId(userId, paginationDto),
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

    @Patch(':id/switch-weather')
    async switchWeather(@Param('id') id: string) {
        return {
            message: 'Field weather status updated successfully',
            data: await this.fieldService.switchWeather(id),
        };
    }

    @Patch(':id/switch-auto-watering')
    async switchAutoWatering(@Param('id') id: string) {
        return {
            message: 'Field auto watering status updated successfully',
            data: await this.fieldService.switchAutoWatering(id),
        };
    }
}
