import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Pestana Configuracion: la API key vive en la base de datos, jamas se
 * devuelve completa, y la seleccion del proveedor reacciona en caliente.
 * Con AI_PROVIDER=gemini y una key falsa, "probar conexion" falla con el
 * mensaje claro (llamada real a Google que responde 400 por key invalida).
 */
describe('Configuracion de IA (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.AI_PROVIDER = 'gemini';
    process.env.ATTEMPT_COOLDOWN_MINUTES = '0';
    delete process.env.DATABASE_URL;
    delete process.env.GEMINI_API_KEY;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    // Limpieza para no afectar otras suites: sin key, sin forceMock.
    await request(app.getHttpServer()).put('/api/settings/ai').send({ geminiApiKey: null, forceMock: false });
    await app.close();
  });

  it('sin key el proveedor activo es el simulado', async () => {
    await request(app.getHttpServer()).put('/api/settings/ai').send({ geminiApiKey: null }).expect(200);
    const status = await request(app.getHttpServer()).get('/api/settings/ai').expect(200);
    expect(status.body.provider).toBe('mock');
    expect(status.body.geminiConfigured).toBe(false);
  });

  it('guardar la key activa gemini y solo muestra la mascara', async () => {
    const updated = await request(app.getHttpServer())
      .put('/api/settings/ai')
      .send({ geminiApiKey: 'AIza-fake-key-1234' })
      .expect(200);
    expect(updated.body.provider).toBe('gemini');
    expect(updated.body.geminiConfigured).toBe(true);
    expect(updated.body.maskedKey).toBe('••••••••1234');
    expect(JSON.stringify(updated.body)).not.toContain('AIza-fake-key-1234');

    // La auditoria registra el cambio sin el valor de la key.
    const audit = await request(app.getHttpServer())
      .get('/api/audit?resourceType=SETTINGS&resourceId=ai')
      .expect(200);
    expect(audit.body.length).toBeGreaterThan(0);
    expect(JSON.stringify(audit.body)).not.toContain('AIza-fake-key-1234');
  });

  it('forceMock vuelve al simulado aunque haya key', async () => {
    const forced = await request(app.getHttpServer())
      .put('/api/settings/ai')
      .send({ forceMock: true })
      .expect(200);
    expect(forced.body.provider).toBe('mock');
    expect(forced.body.geminiConfigured).toBe(true); // la key sigue guardada
  });

  it('probar conexion con key invalida responde ok:false con mensaje', async () => {
    await request(app.getHttpServer()).put('/api/settings/ai').send({ forceMock: false }).expect(200);
    const test = await request(app.getHttpServer()).post('/api/settings/ai/test').expect(201);
    expect(test.body.ok).toBe(false);
    expect(test.body.message.length).toBeGreaterThan(5);
  }, 30000);
});
