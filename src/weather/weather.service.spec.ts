import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException, ServiceUnavailableException } from '@nestjs/common';
import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let fetchMock: jest.SpyInstance;

  const geocodingResponse = [
    { lat: '52.5200', lon: '13.4050', display_name: 'Berlin' },
  ];
  const weatherResponse = { name: 'Berlin', main: { temp: 21.5 } };

  function okResponse(body: unknown): Response {
    return { ok: true, status: 200, json: async () => body } as Response;
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: ConfigService, useValue: { getOrThrow: () => 'test-key' } },
      ],
    }).compile();

    service = module.get(WeatherService);
    fetchMock = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => jest.restoreAllMocks());

  it('wandelt die String-Koordinaten der Geocoding-API in Zahlen um', async () => {
    fetchMock
      .mockResolvedValueOnce(okResponse(geocodingResponse))
      .mockResolvedValueOnce(okResponse(weatherResponse));

    await service.getWeather('10115');

    const weatherUrl = fetchMock.mock.calls[1][0] as URL;
    expect(weatherUrl.searchParams.get('lat')).toBe('52.52');
    expect(weatherUrl.searchParams.get('units')).toBe('metric');
  });

  it('cacht die Koordinaten, sodass die Geocoding-API nur einmal befragt wird', async () => {
    fetchMock
      .mockResolvedValueOnce(okResponse(geocodingResponse))
      .mockResolvedValue(okResponse(weatherResponse));

    await service.getWeather('10115');
    await service.getWeather('10115');

    //3 statt 4 Aufrufe: 1x Geocoding + 2x Wetter
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('meldet 404, wenn die Postleitzahl keinen Treffer hat', async () => {
    fetchMock.mockResolvedValueOnce(okResponse([]));

    await expect(service.getWeather('99999')).rejects.toThrow(HttpException);
  });

  it('uebersetzt einen Netzwerkfehler in 503', async () => {
    fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    await expect(service.getWeather('10115')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
