import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';

import { AppModule } from '../src/app.module';
import { applyRoutingConventions, createOpenApiDocument } from '../src/openapi';

//Das Dokument entsteht allein aus Metadaten - es laeuft kein Request und keine
//Abfrage gegen die externen APIs. Platzhalter reichen der Env-Validierung.
process.env.NODE_ENV ??= 'development';
process.env.JWT_SECRET ??= 'nur-zum-erzeugen-der-doku-mindestens-32-zeichen';
process.env.DATABASE_PATH ??= ':memory:';
process.env.OPENWEATHER_API_KEY ??= 'placeholder';
process.env.GEOCODING_API_KEY ??= 'placeholder';

const outDir = join(__dirname, '..', 'public');

async function main() {
  const app = await NestFactory.create(AppModule, { logger: false });
  applyRoutingConventions(app);

  const document = createOpenApiDocument(app);

  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    join(outDir, 'openapi.json'),
    JSON.stringify(document, null, 2) + '\n',
  );

  await app.close();
  console.log(`openapi.json geschrieben nach ${outDir}`);
}

void main();
