import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SensorService } from './sensor.service';

@Controller('sensor')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}
  
  @Post('data')
  handleSensorData(@Body() data: any) {
    console.log('Dữ liệu từ cảm biến:', data);
  }
}
