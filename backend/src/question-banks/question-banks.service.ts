import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionBankEntity } from './question-bank.entity';
import { QuestionEntity } from './question.entity';
import { CoursesService } from '../courses/courses.service';
import { SourcesService } from '../sources/sources.service';
import { AuditService } from '../audit/audit.service';
import { AiProviderService } from '../generation/ai-provider.service';
import { CourseGenerationEntity } from '../generation/course-generation.entity';

export interface QuestionDto {
  caseText: string;
  prompt: string;
  expectedConcepts: string[];
  sourceRefs: string[];
  variationTemplate?: { variableAspects: string[]; constraints: string };
}

@Injectable()
export class QuestionBanksService {
  constructor(
    @InjectRepository(QuestionBankEntity) private readonly banks: Repository<QuestionBankEntity>,
    @InjectRepository(QuestionEntity) private readonly questions: Repository<QuestionEntity>,
    private readonly courses: CoursesService,
    private readonly sources: SourcesService,
    private readonly audit: AuditService,
    private readonly ai: AiProviderService,
    @InjectRepository(CourseGenerationEntity)
    private readonly generations: Repository<CourseGenerationEntity>,
  ) {}

  /** Genera (o regenera) el banco desde el contenido y las fuentes (RF-14). */
  async generate(courseId: number) {
    const course = await this.courses.findById(courseId);
    if (course.status !== 'DRAFT' && course.status !== 'REVIEW') {
      throw new BadRequestException('El banco solo puede generarse mientras el curso esta en borrador o revision');
    }
    if (!course.sourceSetId) throw new BadRequestException('El curso no tiene un cuaderno de fuentes vinculado');
    const files = await this.sources.readSetFiles(course.sourceSetId);
    if (files.length === 0) throw new BadRequestException('El cuaderno del curso no tiene fuentes cargadas');

    const started = Date.now();
    try {
      const result = await this.ai.provider.generateQuestionBank({
        course: {
          title: course.title,
          description: course.description,
          objective: course.objective,
          audience: course.audience,
          level: course.level,
          targetHours: course.targetHours,
        },
        lessons: course.modules.flatMap((m) =>
          m.lessons.map((l) => ({ title: l.title, content: l.content, sourceRefs: l.sourceRefs })),
        ),
        sources: files,
      });

      await this.questions.delete({ bankId: await this.ensureBank(courseId).then((b) => b.id) });
      const bank = await this.ensureBank(courseId);
      bank.status = 'DRAFT';
      bank.approvedAt = null;
      await this.banks.save(bank);
      await this.questions.delete({ bankId: bank.id });

      for (const [i, draft] of result.questions.entries()) {
        await this.questions.save(
          this.questions.create({
            bankId: bank.id,
            position: i,
            caseText: draft.caseText,
            prompt: draft.prompt,
            expectedConcepts: draft.expectedConcepts,
            sourceRefs: draft.sourceRefs,
            variationTemplate: draft.variationTemplate ?? { variableAspects: [], constraints: '' },
          }),
        );
      }

      await this.trace(courseId, 'QUESTIONS', started, 'SUCCESS', { provider: this.ai.name, questions: result.questions.length });
      await this.audit.log({ action: 'BANK_GENERATED', resourceType: 'COURSE', resourceId: courseId, detail: { questions: result.questions.length } });
      return this.findByCourse(courseId);
    } catch (error) {
      await this.trace(courseId, 'QUESTIONS', started, 'ERROR', { provider: this.ai.name, message: (error as Error).message });
      throw error;
    }
  }

  async findByCourse(courseId: number) {
    const bank = await this.banks.findOne({ where: { courseId }, relations: { questions: true } });
    if (!bank) throw new NotFoundException('El curso aun no tiene banco de preguntas');
    bank.questions.sort((a, b) => a.position - b.position);
    return bank;
  }

  async addQuestion(courseId: number, dto: QuestionDto) {
    const bank = await this.requireDraftBank(courseId);
    const count = await this.questions.count({ where: { bankId: bank.id } });
    const saved = await this.questions.save(
      this.questions.create({
        bankId: bank.id,
        position: count,
        ...dto,
        variationTemplate: dto.variationTemplate ?? { variableAspects: [], constraints: '' },
      }),
    );
    await this.audit.log({ action: 'QUESTION_ADDED', resourceType: 'COURSE', resourceId: courseId });
    return saved;
  }

  async updateQuestion(questionId: number, dto: Partial<QuestionDto>) {
    const question = await this.questions.findOne({ where: { id: questionId }, relations: { bank: true } });
    if (!question) throw new NotFoundException('Pregunta no encontrada');
    if (question.bank.status === 'APPROVED') {
      // Editar contenido aprobado exige reaprobar: el banco vuelve a borrador.
      question.bank.status = 'DRAFT';
      question.bank.approvedAt = null;
      await this.banks.save(question.bank);
    }
    Object.assign(question, dto);
    const saved = await this.questions.save(question);
    await this.audit.log({ action: 'QUESTION_UPDATED', resourceType: 'COURSE', resourceId: question.bank.courseId });
    return saved;
  }

  async deleteQuestion(questionId: number) {
    const question = await this.questions.findOne({ where: { id: questionId }, relations: { bank: true } });
    if (!question) throw new NotFoundException('Pregunta no encontrada');
    if (question.bank.status === 'APPROVED') {
      question.bank.status = 'DRAFT';
      question.bank.approvedAt = null;
      await this.banks.save(question.bank);
    }
    await this.questions.delete({ id: questionId });
    await this.audit.log({ action: 'QUESTION_DELETED', resourceType: 'COURSE', resourceId: question.bank.courseId });
  }

  /** Aprobacion explicita (RF-17): exige al menos una pregunta. */
  async approve(courseId: number) {
    const bank = await this.findByCourse(courseId);
    if (bank.questions.length === 0) {
      throw new BadRequestException('El banco no puede aprobarse sin preguntas');
    }
    bank.status = 'APPROVED';
    bank.approvedAt = new Date();
    const saved = await this.banks.save(bank);
    await this.audit.log({ action: 'BANK_APPROVED', resourceType: 'COURSE', resourceId: courseId, detail: { questions: bank.questions.length } });
    return saved;
  }

  async approvedBankWithQuestions(courseId: number): Promise<QuestionEntity[]> {
    const bank = await this.banks.findOne({ where: { courseId }, relations: { questions: true } });
    if (!bank || bank.status !== 'APPROVED' || bank.questions.length === 0) return [];
    bank.questions.sort((a, b) => a.position - b.position);
    return bank.questions;
  }

  private async ensureBank(courseId: number): Promise<QuestionBankEntity> {
    const existing = await this.banks.findOne({ where: { courseId } });
    if (existing) return existing;
    return this.banks.save(this.banks.create({ courseId }));
  }

  private async requireDraftBank(courseId: number): Promise<QuestionBankEntity> {
    const bank = await this.banks.findOne({ where: { courseId } });
    if (!bank) throw new NotFoundException('El curso aun no tiene banco de preguntas; generelo primero');
    if (bank.status === 'APPROVED') {
      bank.status = 'DRAFT';
      bank.approvedAt = null;
      await this.banks.save(bank);
    }
    return bank;
  }

  private async trace(
    courseId: number,
    phase: string,
    started: number,
    status: 'SUCCESS' | 'ERROR',
    summary: Record<string, unknown>,
  ): Promise<void> {
    await this.generations.save(
      this.generations.create({
        courseId,
        phase: phase as 'QUESTIONS',
        lessonId: null,
        provider: this.ai.name,
        model: this.ai.model,
        status,
        durationMs: Date.now() - started,
        inputSummary: summary,
        message: status === 'ERROR' ? String(summary.message ?? '') : null,
      }),
    );
  }
}
