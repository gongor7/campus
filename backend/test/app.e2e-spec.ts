import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

// Generar el contenido de todas las lecciones del curso supera los 5 s por defecto.
jest.setTimeout(60000);

/**
 * Flujo completo del MVP contra la base local (docker compose up -d),
 * con AI_PROVIDER=mock: cuaderno -> curso -> generacion -> edicion ->
 * revision -> publicacion, mas verificaciones de auditoria y errores.
 */
describe('Campus ASFI - flujo completo (e2e)', () => {
  let app: INestApplication;
  let sourceSetId: number;
  let courseId: number;
  let lessonId: number;

  beforeAll(async () => {
    process.env.AI_PROVIDER = 'mock';
    delete process.env.DATABASE_URL;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('health responde ok', async () => {
    const res = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('la plantilla institucional esta sembrada', async () => {
    const res = await request(app.getHttpServer()).get('/api/templates').expect(200);
    const standard = res.body.find((t: { code: string }) => t.code === 'ASFI_STANDARD');
    expect(standard).toBeDefined();
    expect(standard.sections.length).toBe(5);
  });

  it('crear cuaderno de fuentes y subir documentos', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/source-sets')
      .send({ name: 'Keycloak documentacion', description: 'Fuentes de prueba' })
      .expect(201);
    sourceSetId = created.body.id;

    const uploaded = await request(app.getHttpServer())
      .post(`/api/source-sets/${sourceSetId}/sources`)
      .attach('files', Buffer.from('contenido de prueba del documento oficial'), {
        filename: 'guia-keycloak.txt',
        contentType: 'text/plain',
      })
      .expect(201);
    expect(uploaded.body.length).toBe(1);
    expect(uploaded.body[0].filename).toBe('guia-keycloak.txt');

    const detail = await request(app.getHttpServer())
      .get(`/api/source-sets/${sourceSetId}`)
      .expect(200);
    expect(detail.body.sources.length).toBe(1);
  });

  it('rechaza tipos de archivo no permitidos', async () => {
    await request(app.getHttpServer())
      .post(`/api/source-sets/${sourceSetId}/sources`)
      .attach('files', Buffer.from('<svg/>'), { filename: 'imagen.svg', contentType: 'image/svg+xml' })
      .expect(400);
  });

  it('crear curso con los datos del docente', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/courses')
      .send({
        title: 'Keycloak para servicios institucionales',
        description: 'Curso de prueba',
        objective: 'Operar Keycloak',
        audience: 'Equipo de plataforma',
        level: 'BASIC',
        targetHours: 6,
        sourceSetId,
      })
      .expect(201);
    courseId = res.body.id;
    expect(res.body.status).toBe('DRAFT');
    expect(res.body.templateId).toBeDefined();
  });

  it('generar estructura (Fase A) produce outline valido dentro de la plantilla', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/courses/${courseId}/generate-outline`)
      .expect(201);

    expect(res.body.modules.length).toBeGreaterThanOrEqual(2);
    expect(res.body.sections.length).toBe(4);
    expect(res.body.totalEstimatedMinutes).toBeGreaterThan(0);
    expect(res.body.coverageGaps).toBeDefined();

    const course = await request(app.getHttpServer()).get(`/api/courses/${courseId}`).expect(200);
    expect(course.body.modules.length).toBe(res.body.modules.length);
    lessonId = course.body.modules[0].lessons[0].id;
    expect(lessonId).toBeDefined();
  });

  it('generar contenido de una leccion (Fase B) y editarlo', async () => {
    const generated = await request(app.getHttpServer())
      .post(`/api/lessons/${lessonId}/generate-content`)
      .expect(201);
    expect(generated.body.content.length).toBeGreaterThan(0);
    expect(generated.body.sourceRefs).toBeDefined();

    const edited = await request(app.getHttpServer())
      .patch(`/api/courses/lessons/${lessonId}`)
      .send({ content: 'Contenido ajustado por el docente.' })
      .expect(200);
    expect(edited.body.content).toBe('Contenido ajustado por el docente.');
  });

  it('no se puede publicar sin pasar por revision', async () => {
    await request(app.getHttpServer()).post(`/api/courses/${courseId}/publish`).expect(400);
  });

  it('publicar directo con lecciones sin contenido falla aunque este en revision', async () => {
    await request(app.getHttpServer()).post(`/api/courses/${courseId}/submit-review`).expect(201);
    const res = await request(app.getHttpServer()).post(`/api/courses/${courseId}/publish`).expect(400);
    expect(JSON.stringify(res.body.message)).toContain('contenido');
  });

  it('completar el contenido de todas las lecciones y secciones permite publicar', async () => {
    const course = await request(app.getHttpServer()).get(`/api/courses/${courseId}`).expect(200);
    for (const module of course.body.modules) {
      for (const lesson of module.lessons) {
        await request(app.getHttpServer())
          .post(`/api/lessons/${lesson.id}/generate-content`)
          .expect(201);
      }
    }

    const published = await request(app.getHttpServer())
      .post(`/api/courses/${courseId}/publish`)
      .expect(201);
    expect(published.body.status).toBe('PUBLISHED');
  });

  it('un curso publicado no es editable', async () => {
    await request(app.getHttpServer())
      .patch(`/api/courses/${courseId}`)
      .send({ title: 'Nuevo titulo' })
      .expect(400);
    await request(app.getHttpServer())
      .patch(`/api/courses/lessons/${lessonId}`)
      .send({ content: 'cambio' })
      .expect(400);
  });

  it('la auditoria registra las operaciones del flujo', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/audit?resourceType=COURSE&resourceId=${courseId}`)
      .expect(200);
    const actions = res.body.map((row: { action: string }) => row.action);
    for (const expected of [
      'COURSE_CREATED',
      'GENERATION_OUTLINE',
      'OUTLINE_REPLACED',
      'COURSE_SUBMITTED_REVIEW',
      'COURSE_PUBLISHED',
    ]) {
      expect(actions).toContain(expected);
    }
  });

  it('las generaciones quedan trazadas con proveedor y modelo', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/courses/${courseId}/generations`)
      .expect(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((g: { status: string }) => g.status === 'SUCCESS')).toBe(true);
    expect(res.body[0].provider).toBe('mock');
  });

  it('un outline invalido (1 modulo) es rechazado por la plantilla', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/courses')
      .send({
        title: 'Curso de validacion',
        level: 'BASIC',
        targetHours: 4,
        sourceSetId,
      })
      .expect(201);

    await request(app.getHttpServer())
      .put(`/api/courses/${created.body.id}/outline`)
      .send({
        modules: [
          {
            title: 'Unico modulo',
            estimatedMinutes: 60,
            lessons: [
              { title: 'L1', estimatedMinutes: 30 },
              { title: 'L2', estimatedMinutes: 30 },
            ],
          },
        ],
        sections: [
          { type: 'INTRODUCTION', title: 'Intro' },
          { type: 'PRACTICE', title: 'Practica' },
          { type: 'EVALUATION', title: 'Eval' },
          { type: 'CLOSING', title: 'Cierre' },
        ],
      })
      .expect(400);
  });
});
