import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseGenerationEntity } from './course-generation.entity';
import { LessonContent, OutlineProposal } from './ai-provider';
import { CoursesService } from '../courses/courses.service';
import { SourcesService } from '../sources/sources.service';
import { StorageService, StoredFile } from '../sources/storage.service';
import { TemplatesService } from '../templates/templates.service';
import { TemplateValidatorService } from '../templates/template-validator.service';
import { AuditService } from '../audit/audit.service';
import { LessonEntity } from '../courses/lesson.entity';
import { ReplaceOutlineDto } from '../courses/dto';
import { AiProviderService } from './ai-provider.service';

/**
 * Orquesta las dos fases de generacion (decision D7):
 * A) propuesta de estructura a partir del cuaderno del curso;
 * B) contenido por leccion, usando solo las fuentes asignadas a su modulo.
 */
@Injectable()
export class GenerationService {
  constructor(
    @InjectRepository(CourseGenerationEntity)
    private readonly generations: Repository<CourseGenerationEntity>,
    @InjectRepository(LessonEntity)
    private readonly lessonsRepo: Repository<LessonEntity>,
    private readonly courses: CoursesService,
    private readonly sources: SourcesService,
    private readonly storage: StorageService,
    private readonly templates: TemplatesService,
    private readonly validator: TemplateValidatorService,
    private readonly audit: AuditService,
    private readonly ai: AiProviderService,
  ) {}

  async generateOutline(courseId: number): Promise<OutlineProposal> {
    const course = await this.courses.findById(courseId);
    if (!course.sourceSetId) {
      throw new BadRequestException('El curso no tiene un cuaderno de fuentes vinculado');
    }

    const started = Date.now();
    try {
      const files = await this.sources.readSetFiles(course.sourceSetId);
      const template = course.template ?? (await this.templates.findById(course.templateId));
      const proposal = await this.ai.provider.generateOutline({
        course: this.courseContext(course),
        templateSections: template.sections,
        sources: files,
      });

      const errors = this.validator.validate(
        {
          modules: proposal.modules.map((m) => ({
            title: m.title,
            lessons: m.lessons.map((l) => ({ title: l.title })),
          })),
          sections: proposal.sections.map((s) => ({ type: s.type })),
        },
        template,
      );
      if (errors.length > 0) {
        throw new BadGatewayException(['La propuesta de IA no cumple la plantilla institucional:', ...errors].join(' '));
      }

      await this.trace(courseId, 'OUTLINE', null, started, 'SUCCESS', {
        provider: this.ai.provider.name,
        sources: files.length,
        modules: proposal.modules.length,
      });
      await this.audit.log({
        action: 'GENERATION_OUTLINE',
        resourceType: 'COURSE',
        resourceId: courseId,
        detail: { provider: this.ai.provider.name, modules: proposal.modules.length },
      });

      // La propuesta se persiste como estructura del curso (editable por el docente).
      await this.courses.replaceOutline(courseId, this.proposalToDto(proposal));
      return proposal;
    } catch (error) {
      await this.trace(courseId, 'OUTLINE', null, started, 'ERROR', {
        provider: this.ai.provider.name,
        message: (error as Error).message,
      });
      throw error;
    }
  }

  async generateLesson(lessonId: number): Promise<LessonContent> {
    const lesson = await this.lessonsRepo.findOne({ where: { id: lessonId } });
    if (!lesson) throw new BadRequestException('Leccion no encontrada');

    const course = await this.courses.findById(lesson.courseId);
    const module = course.modules.find((m) => m.id === lesson.moduleId);
    if (!module) throw new BadRequestException('El modulo de la leccion no existe en el curso');
    if (!course.sourceSetId) throw new BadRequestException('El curso no tiene un cuaderno de fuentes vinculado');

    const started = Date.now();
    try {
      const set = await this.sources.findSet(course.sourceSetId);

      // Fuentes de la leccion: las citadas en la leccion o, en su defecto, las del modulo.
      const lessonRefs = lesson.sourceRefs ?? [];
      const moduleRefs = Array.from(new Set(module.lessons.flatMap((l) => l.sourceRefs ?? [])));
      const chosen = lessonRefs.length > 0 ? lessonRefs : moduleRefs;

      const files: StoredFile[] = [];
      for (const source of set.sources) {
        if (chosen.length === 0 || chosen.includes(source.filename)) {
          const data = await this.storage.read(source.id);
          files.push({ filename: source.filename, mimeType: source.mimeType, base64: data.toString('base64') });
        }
      }

      const content = await this.ai.provider.generateLessonContent({
        course: this.courseContext(course),
        moduleTitle: module.title,
        moduleObjective: module.objective ?? '',
        lessonTitle: lesson.title,
        sources: files,
      });

      await this.courses.updateLesson(lessonId, {
        objective: content.objective,
        content: content.content,
        sourceRefs: content.sourceRefs,
      });

      await this.trace(course.id, 'LESSON', lessonId, started, 'SUCCESS', {
        provider: this.ai.provider.name,
        sources: files.length,
      });
      await this.audit.log({
        action: 'GENERATION_LESSON',
        resourceType: 'LESSON',
        resourceId: lessonId,
        detail: { courseId: course.id, provider: this.ai.provider.name },
      });

      return content;
    } catch (error) {
      await this.trace(course.id, 'LESSON', lessonId, started, 'ERROR', {
        provider: this.ai.provider.name,
        message: (error as Error).message,
      });
      throw error;
    }
  }

  listByCourse(courseId: number): Promise<CourseGenerationEntity[]> {
    return this.generations.find({ where: { courseId }, order: { createdAt: 'DESC', id: 'DESC' } });
  }

  private courseContext(course: {
    title: string;
    description: string;
    objective: string;
    audience: string;
    level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
    targetHours: number;
  }) {
    return {
      title: course.title,
      description: course.description,
      objective: course.objective,
      audience: course.audience,
      level: course.level,
      targetHours: course.targetHours,
    };
  }

  /**
   * Las citas de fuente del modulo se distribuyen entre sus lecciones para que
   * la Fase B (y la regeneracion parcial) use exactamente ese subconjunto.
   */
  private proposalToDto(proposal: OutlineProposal): ReplaceOutlineDto {
    return {
      modules: proposal.modules.map((m) => ({
        title: m.title,
        objective: m.objective,
        estimatedMinutes: m.estimatedMinutes,
        sourceRefs: m.sourceRefs,
        lessons: m.lessons.map((l) => ({
          title: l.title,
          objective: l.objective,
          estimatedMinutes: l.estimatedMinutes,
          sourceRefs: m.sourceRefs,
        })),
      })),
      sections: proposal.sections.map((s) => ({ type: s.type, title: s.title, content: s.content })),
    };
  }

  private async trace(
    courseId: number,
    phase: 'OUTLINE' | 'LESSON',
    lessonId: number | null,
    started: number,
    status: 'SUCCESS' | 'ERROR',
    summary: Record<string, unknown>,
  ): Promise<void> {
    await this.generations.save(
      this.generations.create({
        courseId,
        phase,
        lessonId,
        provider: this.ai.provider.name,
        model: this.ai.provider.model,
        status,
        durationMs: Date.now() - started,
        inputSummary: summary,
        message: status === 'ERROR' ? String(summary.message ?? '') : null,
      }),
    );
  }
}
