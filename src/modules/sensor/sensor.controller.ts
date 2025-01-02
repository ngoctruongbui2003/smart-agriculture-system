import { CreateSensorDto, PaginationDto } from './dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('sensor')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}
  
  @MessagePattern('ngoctruongbui/sensor')
  async handleSensorData(createSensorDto: CreateSensorDto) {
    console.log('Received sensor data:', createSensorDto);

    return {
      message: 'Data received and created successfully',
      data: await this.sensorService.create(createSensorDto)
    };
  }

  @Post()
  async create(@Body() createSensorDto: CreateSensorDto) {
    return {
      message: 'Sensor created successfully',
      data: await this.sensorService.create(createSensorDto),
    };
  }

  @Post('all')
  @HttpCode(HttpStatus.OK)
  async findAll(@Body() paginationDto: PaginationDto) {
    return {
      message: 'Sensor finall successfully',
      data: await this.sensorService.findAll(paginationDto),
    }
  }

  @Post('id/:id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string
  ) {
    return {
      message: 'Sensor finall successfully',
      data: await this.sensorService.findOne(id),
    }
  }

  @Post('field/:fieldId')
  @HttpCode(HttpStatus.OK)
  async findByField(
    @Param('fieldId') fieldId: string,
    @Body() paginationDto: PaginationDto
  ) {
    return {
      message: 'Sensor finall successfully By Field',
      data: await this.sensorService.findByField(fieldId, paginationDto),
    }
  }
}
