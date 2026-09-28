import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttemptEntity, ATTEMPT_TRANSITIONS, AttemptStatus } from './attempt.entity';
import { AttemptQuestionEntity } from './attempt-question.entity';
import { cooldownRemainingMs } from './cooldown';
import { EnrollmentEntity } from '../enrollments/enrollment.entity';
import { EnrollmentsService, EVALUATION_PASS_SCORE } from '../enrollments/enrollments.service';
import { QuestionBanksService } from '../question-banks/question-banks.service';
import { CoursesService } from '../courses/courses.service';
import { AiProviderService } from '../generation/ai-provider.service';
import { AuditService } from '../audit/audit.service';
import { CourseEntity } from '../courses/course.entity';

const QUESTIONS_PER_ATTEMPT = 5;
const GRADING_RETRIES = 2;

@Injectable()
export class AttemptsService {
  private readonly cooldownMinutes: number;

  constructor(
    @InjectRepository(AttemptEntity) private readonly attempts: Repository<AttemptEntity>,
    @InjectRepository(AttemptQuestionEntity) private readonly attemptQuestions: Repository<AttemptQuestionEntity>,
    @InjectRepository(EnrollmentEntity) private readonly enrollmentRepo: Repository<EnrollmentEntity>,
    private readonly enrollments: EnrollmentsService,
    private readonly banks: QuestionBanksService,
    private readonly courses: CoursesService,
    private readonly ai: AiProviderService,
    private readonly audit: AuditService,
    config: ConfigService,
  ) {
    const raw = Number(config.get<string>('ATTEMPT_COOLDOWN_MINUTES', '10'));
    this.cooldownMinutes = Number.isFinite(raw) ? raw : 10;
  }

  /** Inicia un intento (RF-19, RF-20, RF-24): variantes persistidas por plantilla aprobada. */
  async start(studentId: string, courseId: number) {
    const enrollment = await this.enrollments.findEnrollment(studentId, courseId);
    const course = await this.courses.findById(courseId);
    if (course.status !== 'PUBLISHED' && course.status !== 'ARCHIVED') {
      throw new BadRequestException('El curso no esta disponible');
    }
    if (enrollment.status === 'COMPLETED') {
      throw new BadRequestException('El curso ya esta completado');
    }

    const remaining = await this.remainingCooldownMs(studentId, courseId);
    if (remaining > 0) {
      const minutes = Math.ceil(remaining / 60000);
      throw new BadRequestException(`Debes esperar el enfriamiento entre intentos: aproximadamente ${minutes} minuto(s).`);
    }

    const questions = await this.banks.approvedBankWithQuestions(courseId);
    if (questions.length === 0) {
      throw new BadRequestException('El curso no tiene banco de preguntas aprobado');
    }
    const selected = questions.slice(0, QUESTIONS_PER_ATTEMPT);

    const attempt = await this.attempts.save(
      this.attempts.create({ enrollmentId: enrollment.id, courseId, status: 'PREPARING' }),
    );

    let variants: { questionId: number; caseText: string }[];
    try {
      const result = await this.ai.provider.generateVariants({
        seed: attempt.id,
        questions: selected.map((q) => ({
          id: q.id,
          caseText: q.caseText,
          prompt: q.prompt,
          variationTemplate: q.variationTemplate,
        })),
      });
      variants = result.variants;
    } catch (error) {
      await this.setStatus(attempt, 'GRADING_FAILED');
      await this.audit.log({
        action: 'ATTEMPT_START_FAILED',
        resourceType: 'ENROLLMENT',
        resourceId: enrollment.id,
        result: 'ERROR',
        detail: { message: (error as Error).message },
      });
      throw new BadRequestException('No se pudo preparar la evaluacion; el intento no tiene efecto. Intenta nuevamente.');
    }

    for (const question of selected) {
      const variant = variants.find((v) => v.questionId === question.id);
      await this.attemptQuestions.save(
        this.attemptQuestions.create({
          attemptId: attempt.id,
          questionId: question.id,
          variantCase: variant?.caseText ?? question.caseText,
        }),
      );
    }

    await this.setStatus(attempt, 'IN_PROGRESS');
    await this.audit.log({ action: 'ATTEMPT_STARTED', resourceType: 'ENROLLMENT', resourceId: enrollment.id, detail: { attemptId: attempt.id } });
    return this.getAttempt(attempt.id, studentId);
  }

  /** Envio idempotente + calificacion sincrona con reintentos (RF-21 a RF-25). */
  async submit(studentId: string, attemptId: string, answers: { questionId: number; answer: string }[]) {
    const attempt = await this.loadOwned(attemptId, studentId);

    if (attempt.status === 'GRADED') {
      return this.getAttempt(attemptId, studentId); // reenvio ignorado (RF-21)
    }
    if (attempt.status !== 'IN_PROGRESS') {
      throw new BadRequestException(`El intento no admite envio en estado ${attempt.status}`);
    }

    const rows = await this.attemptQuestions.find({ where: { attemptId }, relations: { question: true } });
    for (const row of rows) {
      const provided = answers.find((a) => a.questionId === row.questionId);
      row.answer = provided?.answer?.trim() ?? '';
    }
    await this.attemptQuestions.save(rows);

    attempt.submittedAt = new Date();
    await this.setStatus(attempt, 'GRADING');

    const courseContext = this.courseContext(await this.courses.findById(attempt.courseId));

    try {
      const graded = await this.gradeWithRetry(rows, courseContext);
      for (const row of graded) {
        await this.attemptQuestions.save(row);
      }
      const scores = graded.map((r) => r.score ?? 0);
      const score = scores.length === 0 ? 0 : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

      attempt.score = score;
      await this.setStatus(attempt, 'GRADED');

      const enrollment = await this.enrollmentRepo.findOneOrFail({ where: { id: attempt.enrollmentId } });
      if (enrollment.bestScore === null || score > enrollment.bestScore) {
        enrollment.bestScore = score; // mejor intento (RF-24, decision B8)
        await this.enrollmentRepo.save(enrollment);
      }
      await this.audit.log({
        action: 'ATTEMPT_GRADED',
        resourceType: 'ENROLLMENT',
        resourceId: enrollment.id,
        detail: { attemptId, score, approved: score >= EVALUATION_PASS_SCORE },
      });
      await this.enrollments.completeIfEligible(enrollment); // finalizacion (RF-27)

      return this.getAttempt(attemptId, studentId);
    } catch (error) {
      await this.setStatus(attempt, 'GRADING_FAILED'); // intento sin efecto (RF-25)
      await this.audit.log({
        action: 'ATTEMPT_GRADING_FAILED',
        resourceType: 'ENROLLMENT',
        resourceId: attempt.enrollmentId,
        result: 'ERROR',
        detail: { attemptId, message: (error as Error).message },
      });
      return this.getAttempt(attemptId, studentId);
    }
  }

  async getAttempt(attemptId: string, studentId: string) {
    const attempt = await this.loadOwned(attemptId, studentId);
    const rows = await this.attemptQuestions.find({
      where: { attemptId },
      relations: { question: true },
      order: { id: 'ASC' },
    });
    const graded = attempt.status === 'GRADED';
    return {
      id: attempt.id,
      courseId: attempt.courseId,
      status: attempt.status,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      score: graded ? attempt.score : null,
      passScore: EVALUATION_PASS_SCORE,
      questions: rows.map((r) => ({
        questionId: r.questionId,
        prompt: r.question.prompt,
        variantCase: r.variantCase,
        answer: r.answer,
        score: graded ? r.score : null,
        feedback: graded ? r.feedback : null,
      })),
    };
  }

  /** Historial de intentos calificados (RF-23, RF-28). */
  async history(studentId: string, courseId: number) {
    const enrollment = await this.enrollments.findEnrollment(studentId, courseId);
    const graded = await this.attempts.find({
      where: { enrollmentId: enrollment.id, status: 'GRADED' },
      order: { submittedAt: 'ASC' },
    });
    return graded.map((a) => ({
      id: a.id,
      submittedAt: a.submittedAt,
      score: a.score,
      approved: (a.score ?? 0) >= EVALUATION_PASS_SCORE,
    }));
  }

  async remainingCooldownMs(studentId: string, courseId: number): Promise<number> {
    const enrollment = await this.enrollments.findEnrollment(studentId, courseId);
    const last = await this.attempts.findOne({
      where: { enrollmentId: enrollment.id, status: 'GRADED' },
      order: { submittedAt: 'DESC' },
    });
    if (!last?.submittedAt) return 0;
    return cooldownRemainingMs(last.submittedAt, new Date(), this.cooldownMinutes);
  }

  private async gradeWithRetry(rows: AttemptQuestionEntity[], courseContext: ReturnType<AttemptsService['courseContext']>) {
    let lastError: unknown;
    for (let i = 0; i <= GRADING_RETRIES; i++) {
      try {
        for (const row of rows) {
          const result = await this.ai.provider.gradeAnswer({
            course: courseContext,
            question: {
              variantCase: row.variantCase,
              prompt: row.question.prompt,
              expectedConcepts: row.question.expectedConcepts,
              sourceRefs: row.question.sourceRefs,
            },
            answer: row.answer ?? '',
          });
          row.score = Math.max(0, Math.min(100, Math.round(result.score)));
          row.feedback = result.feedback;
        }
        return rows;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }

  private courseContext(course: CourseEntity) {
    return {
      title: course.title,
      description: course.description,
      objective: course.objective,
      audience: course.audience,
      level: course.level,
      targetHours: course.targetHours,
    };
  }

  private async loadOwned(attemptId: string, studentId: string): Promise<AttemptEntity> {
    const attempt = await this.attempts.findOne({ where: { id: attemptId } });
    if (!attempt) throw new NotFoundException('Intento no encontrado');
    const enrollment = await this.enrollmentRepo.findOneByOrFail({ id: attempt.enrollmentId });
    if (enrollment.studentId !== studentId) throw new NotFoundException('Intento no encontrado');
    return attempt;
  }

  private async setStatus(attempt: AttemptEntity, next: AttemptStatus): Promise<void> {
    if (!ATTEMPT_TRANSITIONS[attempt.status].includes(next)) {
      throw new BadRequestException(`Transicion invalida: ${attempt.status} -> ${next}`);
    }
    attempt.status = next;
    await this.attempts.save(attempt);
  }
}
