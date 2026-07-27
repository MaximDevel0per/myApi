import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
type Coordinates = {
  lon: number;
  lat: number;
};

type Condition = {
  id: number;
  main: string;
  description: string;
  icon: string;
};

type Measurements = {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
};

type Wind = {
  speed: number;
  deg: number;
  gust?: number; //nicht immer vorhanden
};

type SunInfo = {
  country: string;
  sunrise: number;
  sunset: number;
};

//Antwortformat von /data/2.5/weather (Current Weather Data)
//interface statt class: wird nie mit new erzeugt, sondern nur aus res.json() gecastet
export interface WeatherData {
  coord: Coordinates;
  weather: Condition[];
  main: Measurements;
  visibility: number;
  wind: Wind;
  clouds: { all: number };
  dt: number; //Zeitpunkt der Messung, Unix-Zeitstempel in Sekunden
  sys: SunInfo;
  timezone: number; //Versatz zu UTC in Sekunden, keine Zeitzonen-Bezeichnung
  id: number;
  name: string;
}
@Injectable()
export class WeatherService {
  //Dependency Injection -> ConfigService kommt aus ConfigModule.forRoot()
  private readonly config: ConfigService;
  constructor(config: ConfigService) {
    this.config = config;
  }

  async getWeather(lat: number, lon: number): Promise<WeatherData> {
    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));
    url.searchParams.set('units', 'metric');
    url.searchParams.set(
      'appid',
      this.config.getOrThrow<string>('OPENWEATHER_API_KEY'),
    );

    const res = await fetch(url);
    if (!res.ok) {
      throw new HttpException(`OpenWeather: ${res.status}`, res.status);
    }

    return (await res.json()) as WeatherData;
  }
}
