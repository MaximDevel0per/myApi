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

//So kommen die Werte von geocode.maps.co an: als Strings
export type GeocodingResult = {
  lat: string;
  lon: string;
  display_name: string;
};

//Interne Darstellung: als echte Zahlen
export interface Coordinates {
  lat: number;
  lon: number;
}

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
