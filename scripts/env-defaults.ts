/**
 * Platzhalter fuer die Env-Validierung beim Erzeugen der OpenAPI-Doku.
 *
 * Eigenes Modul, weil app.module.ts ConfigModule.forRoot bereits beim Import
 * auswertet: die Werte muessen stehen, bevor dieses Modul geladen wird. Als
 * erster Import in generate-openapi.ts ist das garantiert.
 *
 * Das Dokument entsteht allein aus Metadaten - es laeuft kein Request und keine
 * Abfrage gegen die externen APIs, echte Schluessel braucht es daher nicht.
 */
process.env.NODE_ENV ??= 'development';
process.env.JWT_SECRET ??= 'nur-zum-erzeugen-der-doku-mindestens-32-zeichen';
process.env.DATABASE_PATH ??= ':memory:';
process.env.OPENWEATHER_API_KEY ??= 'placeholder';
process.env.GEOCODING_API_KEY ??= 'placeholder';
