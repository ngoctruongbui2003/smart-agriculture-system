// field.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { FieldService } from './field.service';
import { CreateFieldDto } from './dto';

@Controller('fields')
export class FieldController {
    constructor(private readonly fieldService: FieldService) {}

    // Endpoint to create a new field
    @Post()
    create(@Body() createFieldDto: CreateFieldDto) {
        return this.fieldService.create(createFieldDto);
    }

    // Endpoint to get all fields
    @Get()
    findAll() {
        return this.fieldService.findAll();
    }

    // Endpoint to get a specific field by ID
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.fieldService.findOne(id);
    }

    // Endpoint to update a field by ID
    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateFieldDto: CreateFieldDto,
    ) {
        return this.fieldService.update(id, updateFieldDto);
    }

    // Endpoint to delete a field by ID
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.fieldService.remove(id);
    }
}
