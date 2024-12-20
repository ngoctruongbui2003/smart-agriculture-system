import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable()
export class WeatherService {
  constructor(private readonly httpService: HttpService) {}

  private weatherApiKey = process.env.WEATHER_API_KEY;
  private ipstackApiKey = process.env.IPSTACK_API_KEY;

  // Get location data by IP
  async getLocationByIP(ip: string): Promise<any> {
    const url = `http://api.ipstack.com/${ip}?access_key=${this.ipstackApiKey}`;
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to fetch location');
    }
  }

  // Get weather data by coordinates
  async getWeatherByCoordinates(lat: string, lon: string): Promise<any> {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.weatherApiKey}`
    console.log("+" + url + "+");
    
    try {
      const response = await lastValueFrom(this.httpService.get(url));
      console.log(`response: ${response}`);
      
      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to fetch weather');
    }
  }

  // Combined function
  async getWeatherByIP(ip: string): Promise<any> {
    console.log(`IP: ${ip}`);
    
    const location = await this.getLocationByIP(ip);
    console.log(location);
    
    const { latitude, longitude } = location;
    const data = await this.getWeatherByCoordinates(latitude, longitude);

    return data;
  }
}
