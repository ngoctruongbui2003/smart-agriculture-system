import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('/test')
  test() {
    const startTime = new Date().toISOString();

    return {
      message: 'This is a test',
      data: 'Hello World',
      startTime: startTime,
    };
  }

  @Get('ip/:ip')
  async getWeatherByIP(@Param('ip') ip: string) {
    return {
      message: 'This action returns weather by IP',
      data: await this.weatherService.getWeatherByIP(ip),
    };
  }

  @Get('city/:city')
  async getWeatherByCityName(@Param('city') city: string) {
    return {
      message: 'This action returns weather by City Name',
      data: await this.weatherService.getWeatherByCityName(city),
    };
  }
}
