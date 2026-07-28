import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Notes (e2e)', () => {
  let app: INestApplication<App>;
  let http: App;

  //Ein zufaelliger Suffix haelt die Benutzernamen ueber Testlaeufe hinweg eindeutig
  const suffix = Date.now().toString(36);
  const alice = { username: `alice_${suffix}`, password: 'super-geheim-123' };
  const bob = { username: `bob_${suffix}`, password: 'super-geheim-456' };

  let aliceToken: string;
  let bobToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    //Dieselbe Konfiguration wie in main.ts - sonst testet e2e eine andere App
    app.setGlobalPrefix('api', { exclude: ['health'] });
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
    http = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('GET /health ist ohne Token erreichbar', async () => {
      const res = await request(http).get('/health').expect(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('Registrierung und Login', () => {
    it('POST /api/v1/auth/register legt beide User an', async () => {
      const resA = await request(http)
        .post('/api/v1/auth/register')
        .send(alice)
        .expect(201);
      expect(resA.body.accessToken).toEqual(expect.any(String));
      expect(resA.body.passwordHash).toBeUndefined();
      aliceToken = resA.body.accessToken;

      const resB = await request(http)
        .post('/api/v1/auth/register')
        .send(bob)
        .expect(201);
      bobToken = resB.body.accessToken;
    });

    it('lehnt einen doppelten Benutzernamen mit 409 ab', async () => {
      await request(http).post('/api/v1/auth/register').send(alice).expect(409);
    });

    it('lehnt ein zu kurzes Passwort mit 400 ab', async () => {
      await request(http)
        .post('/api/v1/auth/register')
        .send({ username: `kurz_${suffix}`, password: 'abc' })
        .expect(400);
    });

    it('entfernt unbekannte Felder bzw. lehnt sie ab (whitelist)', async () => {
      await request(http)
        .post('/api/v1/auth/register')
        .send({ ...alice, isAdmin: true })
        .expect(400);
    });

    it('POST /api/v1/auth/login liefert bei falschem Passwort 401', async () => {
      await request(http)
        .post('/api/v1/auth/login')
        .send({ username: alice.username, password: 'falsch-falsch' })
        .expect(401);
    });

    it('GET /api/v1/auth/me gibt den eingeloggten User zurueck', async () => {
      const res = await request(http)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${aliceToken}`)
        .expect(200);
      expect(res.body.username).toBe(alice.username);
    });
  });

  describe('Notizen', () => {
    let aliceNoteId: string;

    it('verweigert den Zugriff ohne Token', async () => {
      await request(http).get('/api/v1/notes').expect(401);
    });

    it('verweigert den Zugriff mit kaputtem Token', async () => {
      await request(http)
        .get('/api/v1/notes')
        .set('Authorization', 'Bearer nicht.echt.jwt')
        .expect(401);
    });

    it('POST /api/v1/notes legt eine Notiz an', async () => {
      const res = await request(http)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ title: 'Einkaufsliste', description: 'Milch, Brot' })
        .expect(201);

      expect(res.body.title).toBe('Einkaufsliste');
      expect(res.body.id).toEqual(expect.any(String));
      aliceNoteId = res.body.id;
    });

    it('lehnt eine Notiz ohne Titel mit 400 ab', async () => {
      await request(http)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ description: 'nur Text' })
        .expect(400);
    });

    it('GET /api/v1/notes zeigt nur die eigenen Notizen', async () => {
      const resA = await request(http)
        .get('/api/v1/notes')
        .set('Authorization', `Bearer ${aliceToken}`)
        .expect(200);
      expect(resA.body).toHaveLength(1);

      //Bob hat noch keine Notiz - er darf Alices Notiz nicht sehen
      const resB = await request(http)
        .get('/api/v1/notes')
        .set('Authorization', `Bearer ${bobToken}`)
        .expect(200);
      expect(resB.body).toHaveLength(0);
    });

    it('meldet den Zugriff auf eine fremde Notiz als 404', async () => {
      await request(http)
        .get(`/api/v1/notes/${aliceNoteId}`)
        .set('Authorization', `Bearer ${bobToken}`)
        .expect(404);
    });

    it('laesst Bob eine fremde Notiz nicht aendern', async () => {
      await request(http)
        .patch(`/api/v1/notes/${aliceNoteId}`)
        .set('Authorization', `Bearer ${bobToken}`)
        .send({ title: 'gekapert' })
        .expect(404);
    });

    it('PATCH aktualisiert nur die uebergebenen Felder', async () => {
      const res = await request(http)
        .patch(`/api/v1/notes/${aliceNoteId}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ title: 'Einkaufsliste (aktualisiert)' })
        .expect(200);

      expect(res.body.title).toBe('Einkaufsliste (aktualisiert)');
      expect(res.body.description).toBe('Milch, Brot');
    });

    it('lehnt eine ungueltige UUID mit 400 ab', async () => {
      await request(http)
        .get('/api/v1/notes/keine-uuid')
        .set('Authorization', `Bearer ${aliceToken}`)
        .expect(400);
    });

    it('DELETE entfernt die Notiz und liefert danach 404', async () => {
      await request(http)
        .delete(`/api/v1/notes/${aliceNoteId}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .expect(204);

      await request(http)
        .get(`/api/v1/notes/${aliceNoteId}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .expect(404);
    });
  });
});
