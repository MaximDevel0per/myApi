import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //unbekannte Felder werden entfernt
      forbidNonWhitelisted: true, //und fuehren zu 400 statt still zu verschwinden
      transform: true, //Query-/Param-Strings werden in DTO-Typen umgewandelt
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    //Token bleibt beim Neuladen der Swagger-UI erhalten
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`NestNotes laeuft auf http://localhost:${port}/api/docs`);
}

void bootstrap();
