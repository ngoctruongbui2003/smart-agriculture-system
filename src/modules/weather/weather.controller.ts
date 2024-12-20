import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('/test')
  test() {
    // Get the current time when the request is received
    const startTime = new Date().toISOString(); // ISO format for easier parsing

    return {
      message: 'This is a test',
      data: 'Hello World',
      startTime: startTime, // Add start time to the response
    };
  }

  @Post()
  create() {
    return {
      message: 'This action adds a new weather',
      data: this.weatherService.create(),
    }
  }

  @Get()
  findAll() {
    return this.weatherService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weatherService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.weatherService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weatherService.remove(+id);
  }

  @Get('ip/:ip')
  async getWeatherByIP(@Param('ip') ip: string) {
    return {
      message: 'This action returns weather by IP',
      data: await this.weatherService.getWeatherByIP(ip),
    };
  }
}
