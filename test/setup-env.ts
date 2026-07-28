//Laeuft vor dem Aufbau des Testmoduls (setupFiles in jest-e2e.json).
//Setzt eine vollstaendige Konfiguration, damit die Env-Validierung durchlaeuft
//und die Tests unabhaengig von einer lokalen .env sind.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-mit-mindestens-32-zeichen-laenge';
process.env.JWT_EXPIRES_IN = '1h';
//Jede Testdatei bekommt ihre eigene fluechtige Datenbank
process.env.DATABASE_PATH = ':memory:';
process.env.OPENWEATHER_API_KEY = 'test-openweather-key';
process.env.GEOCODING_API_KEY = 'test-geocoding-key';
