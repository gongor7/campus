import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity } from '../courses/course.entity';
import { AuditService } from '../audit/audit.service';

/**
 * Transiciones de estado del flujo editorial (SPEC-publication):
 * DRAFT -> REVIEW -> PUBLISHED -> ARCHIVED. Nunca se publica una propuesta
 * de IA sin revision docente, y solo con la estructura y el contenido completos.
 */
@Injectable()
export class PublicationService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courses: Repository<CourseEntity>,
    private readonly audit: AuditService,
  ) {}

  async submitReview(courseId: number): Promise<CourseEntity> {
    const course = await this.load(courseId);
    if (course.status !== 'DRAFT') {
      throw new BadRequestException(`No se puede enviar a revision desde el estado ${course.status}`);
    }
    course.status = 'REVIEW';
    const saved = await this.courses.save(course);
    await this.audit.log({ action: 'COURSE_SUBMITTED_REVIEW', resourceType: 'COURSE', resourceId: courseId });
    return this.reload(saved.id);
  }

  async publish(courseId: number): Promise<CourseEntity> {
    const course = await this.load(courseId);
    if (course.status !== 'REVIEW') {
      throw new BadRequestException(
        `No se puede publicar desde el estado ${course.status}: el curso debe estar en revision (aprobacion docente previa)`,
      );
    }
    const problems = this.completenessProblems(course);
    if (problems.length > 0) {
      throw new BadRequestException(problems);
    }
    course.status = 'PUBLISHED';
    const saved = await this.courses.save(course);
    await this.audit.log({ action: 'COURSE_PUBLISHED', resourceType: 'COURSE', resourceId: courseId });
    return this.reload(saved.id);
  }

  private completenessProblems(course: CourseEntity): string[] {
    const problems: string[] = [];
    if (course.modules.length === 0) problems.push('El curso no tiene estructura (genera la propuesta primero).');
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (!lesson.content || lesson.content.trim().length === 0) {
          problems.push(`La leccion "${lesson.title}" no tiene contenido.`);
        }
      }
    }
    const required = ['INTRODUCTION', 'PRACTICE', 'EVALUATION', 'CLOSING'] as const;
    const present = new Set(course.sections.map((s) => s.type));
    for (const type of required) {
      if (!present.has(type)) problems.push(`Falta la seccion ${type}.`);
    }
    return problems;
  }

  private async load(courseId: number): Promise<CourseEntity> {
    const course = await this.courses.findOne({
      where: { id: courseId },
      relations: { modules: { lessons: true }, sections: true },
    });
    if (!course) throw new BadRequestException('Curso no encontrado');
    course.modules.sort((a, b) => a.position - b.position);
    for (const module of course.modules) module.lessons.sort((a, b) => a.position - b.position);
    return course;
  }

  private reload(courseId: number): Promise<CourseEntity> {
    return this.courses.findOneOrFail({ where: { id: courseId } });
  }
}
