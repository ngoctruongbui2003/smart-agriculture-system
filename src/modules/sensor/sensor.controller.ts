import { CreateSensorDto } from './dto';
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('sensor')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}
  
  // @MessagePattern('sensor/data')
  // async handleSensorData(createSensorDto: CreateSensorDto) {
  //   console.log('Received sensor data:', createSensorDto);

  //   return {
  //     message: 'Data received successfully',
  //     data: await this.sensorService.saveSensorData(createSensorDto)
  //   };
  // }

  @Get()
  async findAll() {
    return {
      message: 'Sensor finall successfully',
      data: await this.sensorService.findAll(),
    }
  }

  @Post()
  async create(@Body() createSensorDto: CreateSensorDto) {
    return {
      message: 'Sensor created successfully',
      data: await this.sensorService.create(createSensorDto),
    };
  }
}
