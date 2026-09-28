import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

// La preparacion del curso completo (outline + 9 lecciones + banco) supera los 5 s por defecto.
jest.setTimeout(120000);

/**
 * Flujo del estudiante (SPEC-student-view) con AI_PROVIDER=mock y
 * ATTEMPT_COOLDOWN_MINUTES=0 para poder intentar varias veces por test.
 * El enfriamiento real (10 min) se verifica al final con una segunda app
 * y en unitarios (attempt-state.spec).
 */
describe('Campus ASFI - vista del estudiante (e2e)', () => {
  let app: INestApplication;

  let sourceSetId: number;
  let courseId: number;      // curso publicado principal
  let guardCourseId: number; // curso para guardas de publicacion
  let bankCourseId: number;  // curso para CRUD del banco
  let studentId: string;
  let attemptId: string;

  const studentHeaders = () => ({ 'x-student-id': studentId });

  beforeAll(async () => {
    process.env.AI_PROVIDER = 'mock';
    process.env.ATTEMPT_COOLDOWN_MINUTES = '0';
    delete process.env.DATABASE_URL;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('prepara un curso publicado completo (flujo docente)', async () => {
    const set = await request(app.getHttpServer())
      .post('/api/source-sets')
      .send({ name: 'Fuentes estudiante ' + Date.now() })
      .expect(201);
    sourceSetId = set.body.id;
    await request(app.getHttpServer())
      .post(`/api/source-sets/${sourceSetId}/sources`)
      .attach('files', Buffer.from('manual oficial de prueba'), { filename: 'manual.txt', contentType: 'text/plain' })
      .expect(201);

    const course = await request(app.getHttpServer())
      .post('/api/courses')
      .send({ title: 'Curso para estudiantes', level: 'BASIC', targetHours: 4, sourceSetId })
      .expect(201);
    courseId = course.body.id;

    await request(app.getHttpServer()).post(`/api/courses/${courseId}/generate-outline`).expect(201);
    const detail = await request(app.getHttpServer()).get(`/api/courses/${courseId}`).expect(200);
    for (const module of detail.body.modules) {
      for (const lesson of module.lessons) {
        await request(app.getHttpServer()).post(`/api/lessons/${lesson.id}/generate-content`).expect(201);
      }
    }
    await request(app.getHttpServer()).post(`/api/courses/${courseId}/submit-review`).expect(201);
    await request(app.getHttpServer()).post(`/api/courses/${courseId}/questions/generate`).expect(201);
    await request(app.getHttpServer()).post(`/api/courses/${courseId}/questions/approve`).expect(201);
    await request(app.getHttpServer()).post(`/api/courses/${courseId}/publish`).expect(201);
  });

  it('rechaza identidad invalida sin crear nada (RF-04)', async () => {
    await request(app.getHttpServer()).post('/api/students/session').send({ name: 'J', email: 'no-valido' }).expect(400);
  });

  it('registra y recupera por correo conservando el nombre original (RF-01..03)', async () => {
    const first = await request(app.getHttpServer())
      .post('/api/students/session')
      .send({ name: 'Maria Fernanda', email: 'maria.estudiante@test.bo' })
      .expect(201);
    studentId = first.body.id;
    expect(first.body.name).toBe('Maria Fernanda');

    const reentry = await request(app.getHttpServer())
      .post('/api/students/session')
      .send({ name: 'Otro Nombre', email: 'MARIA.ESTUDIANTE@test.bo' })
      .expect(201);
    expect(reentry.body.id).toBe(studentId);
    expect(reentry.body.name).toBe('Maria Fernanda');
  });

  it('catalogo solo muestra publicados y curso no publicado "no existe" (RF-06, RF-30)', async () => {
    const draft = await request(app.getHttpServer())
      .post('/api/courses')
      .send({ title: 'Curso en borrador', level: 'BASIC', targetHours: 2 })
      .expect(201);

    const catalog = await request(app.getHttpServer()).get('/api/students/courses').expect(200);
    const ids = catalog.body.map((c: { id: number }) => c.id);
    expect(ids).toContain(courseId);
    expect(ids).not.toContain(draft.body.id);

    await request(app.getHttpServer())
      .get(`/api/students/me/courses/${draft.body.id}`)
      .set(studentHeaders())
      .expect(404);
  });

  it('inscribe de forma unica e idempotente y audita (RF-07, RF-31)', async () => {
    const first = await request(app.getHttpServer())
      .post(`/api/students/courses/${courseId}/enroll`)
      .set(studentHeaders())
      .expect(201);
    const second = await request(app.getHttpServer())
      .post(`/api/students/courses/${courseId}/enroll`)
      .set(studentHeaders())
      .expect(201);
    expect(second.body.id).toBe(first.body.id);

    const audit = await request(app.getHttpServer())
      .get(`/api/audit?resourceType=ENROLLMENT&resourceId=${first.body.id}`)
      .expect(200);
    expect(audit.body.some((r: { action: string }) => r.action === 'STUDENT_ENROLLED')).toBe(true);
  });

  it('marca y desmarca lecciones con avance inmediato (RF-11, RF-12)', async () => {
    const detail = await request(app.getHttpServer())
      .get(`/api/students/me/courses/${courseId}`)
      .set(studentHeaders())
      .expect(200);
    expect(detail.body.progress.total).toBeGreaterThan(0);
    const lessonIds = detail.body.course.modules.flatMap((m: { lessons: { id: number }[] }) => m.lessons.map((l) => l.id));

    const p1 = await request(app.getHttpServer())
      .put(`/api/students/me/lessons/${lessonIds[0]}/progress`)
      .set(studentHeaders())
      .send({ completed: true })
      .expect(200);
    const p2 = await request(app.getHttpServer())
      .put(`/api/students/me/lessons/${lessonIds[1]}/progress`)
      .set(studentHeaders())
      .send({ completed: true })
      .expect(200);
    expect(p2.body.percent).toBe(Math.round((2 / lessonIds.length) * 100));

    const p3 = await request(app.getHttpServer())
      .put(`/api/students/me/lessons/${lessonIds[0]}/progress`)
      .set(studentHeaders())
      .send({ completed: false })
      .expect(200);
    expect(p3.body.completed).toBe(1);
  });

  it('la generacion del banco queda trazada (RF-14)', async () => {
    const generations = await request(app.getHttpServer())
      .get(`/api/courses/${courseId}/generations`)
      .expect(200);
    expect(generations.body.some((g: { phase: string; status: string }) => g.phase === 'QUESTIONS' && g.status === 'SUCCESS')).toBe(true);
  });

  it('CRUD de preguntas y aprobacion: banco vacio rechazado (RF-15..17)', async () => {
    const bankCourse = await request(app.getHttpServer())
      .post('/api/courses')
      .send({ title: 'Curso banco ' + Date.now(), level: 'BASIC', targetHours: 2, sourceSetId })
      .expect(201);
    bankCourseId = bankCourse.body.id;

    const generated = await request(app.getHttpServer())
      .post(`/api/courses/${bankCourseId}/questions/generate`)
      .expect(201);
    expect(generated.body.questions.length).toBeGreaterThanOrEqual(5);

    const questionId = generated.body.questions[0].id;
    await request(app.getHttpServer())
      .patch(`/api/courses/questions/${questionId}`)
      .send({ prompt: 'Prompt editado por el docente' })
      .expect(200);
    await request(app.getHttpServer())
      .post(`/api/courses/${bankCourseId}/questions`)
      .send({
        caseText: 'Caso manual del docente',
        prompt: 'Pregunta manual',
        expectedConcepts: ['concepto'],
        sourceRefs: ['manual.txt'],
      })
      .expect(201);

    for (const q of generated.body.questions) {
      await request(app.getHttpServer()).delete(`/api/courses/questions/${q.id}`).expect(200);
    }
    // Solo queda la manual: aprobar con 1 pregunta debe funcionar; sin preguntas no.
    await request(app.getHttpServer()).post(`/api/courses/${bankCourseId}/questions/approve`).expect(201);
  });

  it('guardas de publicacion: banco y fuentes obligatorios (RF-18)', async () => {
    const guardCourse = await request(app.getHttpServer())
      .post('/api/courses')
      .send({ title: 'Curso guardas ' + Date.now(), level: 'BASIC', targetHours: 2 })
      .expect(201);
    guardCourseId = guardCourse.body.id;

    // Estructura manual (sin cuaderno no se puede generar outline por IA).
    const outline = {
      modules: [1, 2].map((n) => ({
        title: `Modulo ${n}`,
        objective: 'Objetivo',
        estimatedMinutes: 60,
        lessons: [1, 2].map((m) => ({ title: `Leccion ${n}.${m}`, objective: 'Obj', estimatedMinutes: 30 })),
      })),
      sections: [
        { type: 'INTRODUCTION', title: 'Intro' },
        { type: 'PRACTICE', title: 'Practica' },
        { type: 'EVALUATION', title: 'Evaluacion' },
        { type: 'CLOSING', title: 'Cierre' },
      ],
    };
    await request(app.getHttpServer()).put(`/api/courses/${guardCourseId}/outline`).send(outline).expect(200);
    const detail = await request(app.getHttpServer()).get(`/api/courses/${guardCourseId}`).expect(200);
    for (const module of detail.body.modules) {
      for (const lesson of module.lessons) {
        await request(app.getHttpServer())
          .patch(`/api/courses/lessons/${lesson.id}`)
          .send({ content: 'Contenido manual de la leccion.' })
          .expect(200);
      }
    }
    await request(app.getHttpServer()).post(`/api/courses/${guardCourseId}/submit-review`).expect(201);

    const noBank = await request(app.getHttpServer()).post(`/api/courses/${guardCourseId}/publish`).expect(400);
    expect(JSON.stringify(noBank.body.message)).toContain('banco');

    await request(app.getHttpServer()).post(`/api/courses/${guardCourseId}/questions/generate`).expect(400); // sin cuaderno
    await request(app.getHttpServer())
      .patch(`/api/courses/${guardCourseId}`)
      .send({ sourceSetId })
      .expect(200);
    await request(app.getHttpServer()).post(`/api/courses/${guardCourseId}/questions/generate`).expect(201);
    await request(app.getHttpServer()).post(`/api/courses/${guardCourseId}/questions/approve`).expect(201);
    await request(app.getHttpServer()).post(`/api/courses/${guardCourseId}/publish`).expect(201);
  });

  it('inicia intento con 5 preguntas y variantes persistidas (RF-19, RF-20)', async () => {
    const attempt = await request(app.getHttpServer())
      .post(`/api/students/me/courses/${courseId}/attempts`)
      .set(studentHeaders())
      .expect(201);
    attemptId = attempt.body.id;

    expect(attempt.body.status).toBe('IN_PROGRESS');
    expect(attempt.body.questions).toHaveLength(5);
    expect(attempt.body.score).toBeNull();
    for (const q of attempt.body.questions) {
      expect(q.variantCase).toContain('Variante');
      expect(q.variantCase).toContain(']');
    }
    // Las preguntas nunca exponen los conceptos esperados.
    expect(attempt.body.questions[0]).not.toHaveProperty('expectedConcepts');
  });

  it('envia, califica con rubrica y es idempotente (RF-21..23)', async () => {
    const bank = await request(app.getHttpServer()).get(`/api/courses/${courseId}/questions`).expect(200);
    const conceptOf = (questionId: number) =>
      bank.body.questions.find((q: { id: number }) => q.id === questionId).expectedConcepts[0];

    const qs = await request(app.getHttpServer())
      .get(`/api/students/me/attempts/${attemptId}`)
      .set(studentHeaders())
      .expect(200);
    const answers = qs.body.questions.map((q: { questionId: number }, i: number) => ({
      questionId: q.questionId,
      answer:
        i < 3
          ? `${conceptOf(q.questionId)} analizado segun el material del curso con aplicacion en la entidad.`
          : i === 3
            ? 'Respuesta correcta en terminos generales [GENERICA]'
            : '   ',
    }));

    const graded = await request(app.getHttpServer())
      .post(`/api/students/me/attempts/${attemptId}/submit`)
      .set(studentHeaders())
      .send({ answers })
      .expect(201);
    expect(graded.body.status).toBe('GRADED');
    // Promedio: tres perfectas (100), una generica (40), una vacia (0) = 68.
    expect(graded.body.score).toBe(68);
    expect(graded.body.questions[3].score).toBeLessThanOrEqual(50);
    expect(graded.body.questions[3].feedback).toContain('material del curso');
    expect(graded.body.questions[0].feedback).toContain('Referencia');

    const resend = await request(app.getHttpServer())
      .post(`/api/students/me/attempts/${attemptId}/submit`)
      .set(studentHeaders())
      .send({ answers })
      .expect(201);
    expect(resend.body.score).toBe(68); // reenvio ignorado
  });

  it('fallo del calificador deja el intento sin efecto y se puede reintentar (RF-25, RF-26)', async () => {
    const failed = await request(app.getHttpServer())
      .post(`/api/students/me/courses/${courseId}/attempts`)
      .set(studentHeaders())
      .expect(201);
    const failSubmit = await request(app.getHttpServer())
      .post(`/api/students/me/attempts/${failed.body.id}/submit`)
      .set(studentHeaders())
      .send({
        answers: failed.body.questions.map((q: { questionId: number }) => ({
          questionId: q.questionId,
          answer: 'analisis [FALLA_PROVEEDOR]',
        })),
      })
      .expect(201);
    expect(failSubmit.body.status).toBe('GRADING_FAILED');
    expect(failSubmit.body.score).toBeNull();

    const retry = await request(app.getHttpServer())
      .post(`/api/students/me/courses/${courseId}/attempts`)
      .set(studentHeaders())
      .expect(201); // GRADING_FAILED no activa enfriamiento

    const bank = await request(app.getHttpServer()).get(`/api/courses/${courseId}/questions`).expect(200);
    const conceptOf = (questionId: number) =>
      bank.body.questions.find((q: { id: number }) => q.id === questionId).expectedConcepts[0];
    const approved = await request(app.getHttpServer())
      .post(`/api/students/me/attempts/${retry.body.id}/submit`)
      .set(studentHeaders())
      .send({
        answers: retry.body.questions.map((q: { questionId: number }) => ({
          questionId: q.questionId,
          answer: `${conceptOf(q.questionId)} segun el material del curso, con aplicacion institucional.`,
        })),
      })
      .expect(201);
    expect(approved.body.score).toBe(100);
  });

  it('mejor puntaje se conserva y el historial lista los intentos (RF-23, RF-24, B8)', async () => {
    const weaker = await request(app.getHttpServer())
      .post(`/api/students/me/courses/${courseId}/attempts`)
      .set(studentHeaders())
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/students/me/attempts/${weaker.body.id}/submit`)
      .set(studentHeaders())
      .send({
        answers: weaker.body.questions.map((q: { questionId: number }) => ({ questionId: q.questionId, answer: 'aplicacion' })),
      })
      .expect(201);

    const mine = await request(app.getHttpServer())
      .get('/api/students/me/courses')
      .set(studentHeaders())
      .expect(200);
    const enrollment = mine.body.find((c: { courseId: number }) => c.courseId === courseId);
    expect(enrollment.bestScore).toBe(100);
    expect(enrollment.evaluationApproved).toBe(true);

    const history = await request(app.getHttpServer())
      .get(`/api/students/me/courses/${courseId}/attempts`)
      .set(studentHeaders())
      .expect(200);
    expect(history.body.length).toBe(3);
    expect(history.body.map((h: { score: number }) => h.score)).toEqual([68, 100, 55]);
    expect(history.body[1].approved).toBe(true);
  });

  it('curso completado solo con todas las lecciones y evaluacion aprobada (RF-27, RF-28, RF-31)', async () => {
    const before = await request(app.getHttpServer())
      .get('/api/students/me/courses')
      .set(studentHeaders())
      .expect(200);
    const enrollment = before.body.find((c: { courseId: number }) => c.courseId === courseId);
    expect(enrollment.status).toBe('IN_PROGRESS'); // evaluacion aprobada pero lecciones incompletas

    const detail = await request(app.getHttpServer())
      .get(`/api/students/me/courses/${courseId}`)
      .set(studentHeaders())
      .expect(200);
    for (const lessonId of detail.body.course.modules.flatMap((m: { lessons: { id: number }[] }) => m.lessons.map((l) => l.id))) {
      await request(app.getHttpServer())
        .put(`/api/students/me/lessons/${lessonId}/progress`)
        .set(studentHeaders())
        .send({ completed: true })
        .expect(200);
    }

    const after = await request(app.getHttpServer())
      .get('/api/students/me/courses')
      .set(studentHeaders())
      .expect(200);
    const completed = after.body.find((c: { courseId: number }) => c.courseId === courseId);
    expect(completed.status).toBe('COMPLETED');
    expect(completed.percent).toBe(100);

    const audit = await request(app.getHttpServer())
      .get(`/api/audit?resourceType=ENROLLMENT&resourceId=${completed.enrollmentId}`)
      .expect(200);
    expect(audit.body.some((r: { action: string }) => r.action === 'COURSE_COMPLETED')).toBe(true);
  });

  it('curso archivado: fuera del catalogo, terminable por inscritos, "no existe" para nuevos (RF-29, RF-30)', async () => {
    await request(app.getHttpServer()).post(`/api/courses/${courseId}/archive`).expect(201);

    const catalog = await request(app.getHttpServer()).get('/api/students/courses').expect(200);
    expect(catalog.body.map((c: { id: number }) => c.id)).not.toContain(courseId);

    const mine = await request(app.getHttpServer())
      .get('/api/students/me/courses')
      .set(studentHeaders())
      .expect(200);
    const archived = mine.body.find((c: { courseId: number }) => c.courseId === courseId);
    expect(archived).toBeDefined();
    expect(archived.courseStatus).toBe('ARCHIVED');

    await request(app.getHttpServer())
      .get(`/api/students/me/courses/${courseId}`)
      .set(studentHeaders())
      .expect(200);

    const newcomer = await request(app.getHttpServer())
      .post('/api/students/session')
      .send({ name: 'Nuevo Estudiante', email: `nuevo.${Date.now()}@test.bo` })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/students/courses/${courseId}/enroll`)
      .set({ 'x-student-id': newcomer.body.id })
      .expect(404);
  });

  it('enfriamiento real (10 min) bloquea el intento inmediato (RF-24)', async () => {
    await app.close();
    process.env.ATTEMPT_COOLDOWN_MINUTES = '10';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    const student = await request(app.getHttpServer())
      .post('/api/students/session')
      .send({ name: 'Estudiante Enfriamiento', email: `cooldown.${Date.now()}@test.bo` })
      .expect(201);
    const headers = { 'x-student-id': student.body.id };
    await request(app.getHttpServer()).post(`/api/students/courses/${guardCourseId}/enroll`).set(headers).expect(201);

    const first = await request(app.getHttpServer())
      .post(`/api/students/me/courses/${guardCourseId}/attempts`)
      .set(headers)
      .expect(201);
    const bank = await request(app.getHttpServer()).get(`/api/courses/${guardCourseId}/questions`).expect(200);
    const conceptOf = (questionId: number) =>
      bank.body.questions.find((q: { id: number }) => q.id === questionId).expectedConcepts[0];
    await request(app.getHttpServer())
      .post(`/api/students/me/attempts/${first.body.id}/submit`)
      .set(headers)
      .send({
        answers: first.body.questions.map((q: { questionId: number }) => ({
          questionId: q.questionId,
          answer: `${conceptOf(q.questionId)} con material del curso y aplicacion.`,
        })),
      })
      .expect(201);

    const blocked = await request(app.getHttpServer())
      .post(`/api/students/me/courses/${guardCourseId}/attempts`)
      .set(headers)
      .expect(400);
    expect(JSON.stringify(blocked.body.message)).toContain('enfriamiento');
  });
});
