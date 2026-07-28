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
  //abortOnError: false - sonst faengt Nest Init-Fehler selbst ab, beendet mit
  //Code 1 und die Meldung verschwindet zusammen mit dem deaktivierten Logger
  const app = await NestFactory.create(AppModule, {
    logger: ['error'],
    abortOnError: false,
  });
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

main().catch((err: unknown) => {
  //Bewusst console.log: stdout ist in den CI-Logs zuverlaessig sichtbar
  console.log('Erzeugen des OpenAPI-Dokuments fehlgeschlagen:');
  console.log(err instanceof Error ? (err.stack ?? err.message) : err);
  process.exit(1);
});
