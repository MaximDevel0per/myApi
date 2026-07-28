import { INestApplication, VersioningType } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

/**
 * Pfad-Konventionen der API. Muss vor createOpenApiDocument laufen,
 * sonst fehlen Prefix und Version in den dokumentierten Pfaden.
 */
export function applyRoutingConventions(app: INestApplication) {
  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
}

/**
 * Erzeugt das OpenAPI-Dokument aus den Controller-Metadaten. Wird zur Laufzeit
 * fuer /api/docs genutzt und im Build fuer die statische Doku auf GitHub Pages.
 */
export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('NestNotes API')
    .setDescription(
      'Notizverwaltung mit JWT-Authentifizierung. Jede Notiz gehoert genau einem User.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Registrierung und Login')
    .addTag('notes', 'CRUD auf eigenen Notizen')
    .addTag('weather', 'Wetter zu einer Postleitzahl')
    .addTag('health', 'Liveness-Check')
    .build();

  return SwaggerModule.createDocument(app, config);
}
