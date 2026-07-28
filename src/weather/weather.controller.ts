import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { WeatherData } from './weather.types';
import { GetWeatherQueryDto } from './dto/get-weather.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('weather')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @ApiOperation({ summary: 'Aktuelles Wetter zu einer Postleitzahl' })
  @ApiResponse({ status: 200, description: 'Wetterdaten von OpenWeather' })
  @ApiResponse({ status: 404, description: 'Postleitzahl nicht gefunden' })
  @ApiResponse({ status: 503, description: 'Fremd-API nicht erreichbar' })
  getWeather(@Query() query: GetWeatherQueryDto): Promise<WeatherData> {
    return this.weatherService.getWeather(query.postalcode);
  }
}
