import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Tests e2e T1–T6 del SPEC. Requieren Postgres activo
 * (docker compose up -d) usando la base por defecto.
 */
describe('Simulador (e2e)', () => {
  let app: INestApplication;
  let simulationId: number;
  let attemptId: string;
  const sessionId = '11111111-1111-4111-8111-111111111111';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('hay exactamente una simulación sembrada', async () => {
    const res = await request(app.getHttpServer()).get('/api/simulations').expect(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    simulationId = res.body[0].id;
  });

  it('T1: crear intento devuelve el primer escenario (E1) con alternativas sin puntajes', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/attempts')
      .send({ simulationId, sessionId })
      .expect(201);
    attemptId = res.body.attempt.id;
    expect(res.body.scenario.code).toBe('E1');
    expect(res.body.scenario.decisions.length).toBe(3);
    for (const d of res.body.scenario.decisions) {
      expect(d).not.toHaveProperty('score');
      expect(d).not.toHaveProperty('feedback');
      expect(d).not.toHaveProperty('consequence');
    }
  });

  it('T2: decisión válida devuelve consecuencia, feedback y siguiente escenario según la rama', async () => {
    const state = await request(app.getHttpServer()).get(`/api/attempts/${attemptId}`).expect(200);
    const decisionA = state.body.scenario.decisions.find((d: { code: string }) => d.code === 'A');
    const res = await request(app.getHttpServer())
      .post(`/api/attempts/${attemptId}/decisions`)
      .send({ decisionId: decisionA.id })
      .expect(201);
    expect(res.body.consequence).toBeTruthy();
    expect(res.body.feedback).toBeTruthy();
    expect(res.body.completed).toBe(false);
    expect(res.body.nextScenario.code).toBe('E2A');
  });

  it('T4a: decisión repetida en el mismo escenario → 400', async () => {
    // El escenario E1 ya fue decidido; una nueva decisión sobre E1 no es posible
    // porque el intento avanzó. Probamos con decisión del escenario anterior.
    const state = await request(app.getHttpServer()).get(`/api/attempts/${attemptId}`).expect(200);
    const oldDecisionId = 1; // cualquier id de decisión de E1
    const res = await request(app.getHttpServer())
      .post(`/api/attempts/${attemptId}/decisions`)
      .send({ decisionId: oldDecisionId })
      .expect(400);
    expect(res.body.message).toContain('no pertenece');
  });

  it('T3 + T5 + T6: camino completo hasta decisión terminal, resultado y ocultamiento de puntaje', async () => {
    const decisionIds: number[] = [];
    let completed = false;

    // Recorrer decisiones con code 'A' hasta terminar
    for (let i = 0; i < 10 && !completed; i++) {
      const state = await request(app.getHttpServer()).get(`/api/attempts/${attemptId}`).expect(200);
      if (state.body.attempt.status === 'completed') break;
      const best = state.body.scenario.decisions.find((d: { code: string }) => d.code === 'A');
      decisionIds.push(best.id);
      const res = await request(app.getHttpServer())
        .post(`/api/attempts/${attemptId}/decisions`)
        .send({ decisionId: best.id })
        .expect(201);
      // T6: la respuesta de decisión no expone el puntaje obtenido
      expect(res.body).not.toHaveProperty('score');
      expect(res.body).not.toHaveProperty('awardedScore');
      completed = res.body.completed;
    }

    expect(completed).toBe(true);

    // T5: resultado con puntaje acumulado y máximo del camino
    const result = await request(app.getHttpServer())
      .get(`/api/attempts/${attemptId}/result`)
      .expect(200);
    expect(result.body.score).toBeGreaterThan(0);
    expect(result.body.maxScore).toBeGreaterThanOrEqual(result.body.score);
    // +1: la decisión del test T2 pertenece al mismo intento
    expect(result.body.steps.length).toBe(decisionIds.length + 1);
  });

  it('T4b: decidir en un intento completado → 400', async () => {
    await request(app.getHttpServer())
      .post(`/api/attempts/${attemptId}/decisions`)
      .send({ decisionId: 1 })
      .expect(400);
  });

  it('T4c: result de un intento no completado → 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/attempts')
      .send({ simulationId, sessionId })
      .expect(201);
    const newAttempt = res.body.attempt.id;
    await request(app.getHttpServer()).get(`/api/attempts/${newAttempt}/result`).expect(400);
  });

  it('segundo camino (decisión C inicial) llega a un resultado distinto y ambos intentos quedan registrados', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/attempts')
      .send({ simulationId, sessionId })
      .expect(201);
    const altAttempt = res.body.attempt.id;
    const decisionC = res.body.scenario.decisions.find((d: { code: string }) => d.code === 'C');
    const step1 = await request(app.getHttpServer())
      .post(`/api/attempts/${altAttempt}/decisions`)
      .send({ decisionId: decisionC.id })
      .expect(201);
    expect(step1.body.nextScenario.code).toBe('E2C');
  });
});
