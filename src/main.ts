import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { applyRoutingConventions, createOpenApiDocument } from './openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  applyRoutingConventions(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //unbekannte Felder werden entfernt
      forbidNonWhitelisted: true, //und fuehren zu 400 statt still zu verschwinden
      transform: true, //Query-/Param-Strings werden in DTO-Typen umgewandelt
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const document = createOpenApiDocument(app);
  SwaggerModule.setup('api/docs', app, document, {
    //Token bleibt beim Neuladen der Swagger-UI erhalten
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`NestNotes laeuft auf http://localhost:${port}/api/docs`);
}

void bootstrap();
