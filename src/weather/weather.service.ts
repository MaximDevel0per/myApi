import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Coordinates, GeocodingResult, WeatherData } from './weather.types';

const GEOCODING_CACHE_TTL_MS = 24 * 60 * 60 * 1000; //Koordinaten einer PLZ aendern sich nicht
const UPSTREAM_TIMEOUT_MS = 5000;

interface CacheEntry {
  coordinates: Coordinates;
  expiresAt: number;
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  //Spart pro Wetterabfrage einen Fremd-API-Call - die Geocoding-API hat ein knappes Rate-Limit
  private readonly geocodingCache = new Map<string, CacheEntry>();

  constructor(private readonly config: ConfigService) {}

  async getWeather(postalcode: string): Promise<WeatherData> {
    const coordinates = await this.getCoordinates(postalcode);

    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    url.searchParams.set('lat', String(coordinates.lat));
    url.searchParams.set('lon', String(coordinates.lon));
    url.searchParams.set('units', 'metric');
    url.searchParams.set(
      'appid',
      this.config.getOrThrow<string>('OPENWEATHER_API_KEY'),
    );

    return this.fetchJson<WeatherData>(url, 'OpenWeather');
  }

  private async getCoordinates(postalcode: string): Promise<Coordinates> {
    const cached = this.geocodingCache.get(postalcode);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.coordinates;
    }

    const url = new URL('https://geocode.maps.co/search');
    url.searchParams.set('q', postalcode);
    url.searchParams.set(
      'api_key',
      this.config.getOrThrow<string>('GEOCODING_API_KEY'),
    );

    //Die API liefert eine Trefferliste, nicht ein einzelnes Ergebnis
    const results = await this.fetchJson<GeocodingResult[]>(url, 'Geocoding');
    if (results.length === 0) {
      throw new HttpException(
        `Keine Koordinaten fuer Postleitzahl ${postalcode} gefunden`,
        HttpStatus.NOT_FOUND,
      );
    }

    //Umwandlung an der Systemgrenze: Strings der API -> Zahlen im eigenen Modell
    const coordinates: Coordinates = {
      lat: Number(results[0].lat),
      lon: Number(results[0].lon),
    };

    this.geocodingCache.set(postalcode, {
      coordinates,
      expiresAt: Date.now() + GEOCODING_CACHE_TTL_MS,
    });

    return coordinates;
  }

  /**
   * Ein haengender Fremd-Call darf den Request nicht unbegrenzt blockieren,
   * darum AbortSignal.timeout statt eines nackten fetch.
   */
  private async fetchJson<T>(url: URL, upstream: string): Promise<T> {
    let res: Response;
    try {
      res = await fetch(url, {
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });
    } catch (error) {
      //Die URL enthaelt den API-Key - niemals mitloggen
      this.logger.error(`${upstream} nicht erreichbar: ${String(error)}`);
      throw new ServiceUnavailableException(`${upstream} nicht erreichbar`);
    }

    if (!res.ok) {
      throw new HttpException(`${upstream}: ${res.status}`, res.status);
    }

    return (await res.json()) as T;
  }
}
