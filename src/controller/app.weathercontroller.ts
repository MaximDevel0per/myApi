import {
  Controller,
  Get,
  HttpCode,
  ParseFloatPipe,
  Query,
} from '@nestjs/common';

import { WeatherData, WeatherService } from '../services/app.weatherservice';
import { ApiQuery } from '@nestjs/swagger';

@Controller('weather')
export class WeatherController {
    private readonly weatherService: WeatherService;
    
    constructor(weatherService: WeatherService) {
        this.weatherService = weatherService
    }

    @Get('getWeather')
    @HttpCode(200)
    @ApiQuery({ name: 'lat', type: Number })
    @ApiQuery({ name: 'lon', type: Number })
    async getWeather(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lon', ParseFloatPipe) lon: number,
    ): Promise<WeatherData> {
    return await this.weatherService.getWeather(lat, lon);
    }
}
