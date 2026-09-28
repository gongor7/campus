import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentEntity } from './enrollment.entity';
import { LessonProgressEntity } from './lesson-progress.entity';
import { LessonEntity } from '../courses/lesson.entity';
import { CoursesService } from '../courses/courses.service';
import { AuditService } from '../audit/audit.service';
import { CourseEntity } from '../courses/course.entity';

export const EVALUATION_PASS_SCORE = 70;

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(EnrollmentEntity) private readonly enrollments: Repository<EnrollmentEntity>,
    @InjectRepository(LessonProgressEntity) private readonly progress: Repository<LessonProgressEntity>,
    @InjectRepository(LessonEntity) private readonly lessons: Repository<LessonEntity>,
    private readonly courses: CoursesService,
    private readonly audit: AuditService,
  ) {}

  /** Inscripcion unica e idempotente a un curso publicado (RF-07). */
  async enroll(studentId: string, courseId: number): Promise<EnrollmentEntity> {
    const course = await this.courses.findById(courseId);
    if (course.status !== 'PUBLISHED') {
      throw new NotFoundException('El curso no existe');
    }
    const existing = await this.enrollments.findOne({ where: { studentId, courseId } });
    if (existing) return existing;

    const enrollment = await this.enrollments.save(this.enrollments.create({ studentId, courseId }));
    await this.audit.log({ action: 'STUDENT_ENROLLED', resourceType: 'ENROLLMENT', resourceId: enrollment.id, detail: { studentId, courseId } });
    return enrollment;
  }

  /** Mis cursos: incluye archivados y completados como historico (RF-08, RF-29). */
  async myCourses(studentId: string) {
    const list = await this.enrollments.find({
      where: { studentId },
      relations: { course: true },
      order: { updatedAt: 'DESC' },
    });
    const result = [];
    for (const enrollment of list) {
      const progress = await this.progressOf(enrollment);
      result.push({
        enrollmentId: enrollment.id,
        courseId: enrollment.courseId,
        title: enrollment.course.title,
        level: enrollment.course.level,
        targetHours: enrollment.course.targetHours,
        courseStatus: enrollment.course.status,
        status: enrollment.status,
        bestScore: enrollment.bestScore,
        evaluationApproved: (enrollment.bestScore ?? 0) >= EVALUATION_PASS_SCORE,
        completedLessons: progress.completed,
        totalLessons: progress.total,
        percent: progress.percent,
      });
    }
    return result;
  }

  /**
   * Curso visible para el estudiante (RF-30): inscrito lo ve en cualquier
   * estado; no inscrito solo si esta PUBLISHED; si no, "no existe".
   */
  async courseForStudent(studentId: string, courseId: number) {
    const enrollment = await this.enrollments.findOne({ where: { studentId, courseId } });
    const course = await this.courses.findById(courseId);
    if (!enrollment && course.status !== 'PUBLISHED') {
      throw new NotFoundException('El curso no existe');
    }
    const progress = await this.progressOf(enrollment ?? ({ id: -1 } as EnrollmentEntity));
    const marked = enrollment ? await this.markedLessonIds(enrollment.id) : [];
    return {
      course,
      enrollment: enrollment
        ? {
            id: enrollment.id,
            status: enrollment.status,
            bestScore: enrollment.bestScore,
            evaluationApproved: (enrollment.bestScore ?? 0) >= EVALUATION_PASS_SCORE,
            completedAt: enrollment.completedAt,
          }
        : null,
      progress,
      markedLessonIds: marked,
    };
  }

  /** Marcar o desmarcar una leccion (RF-11) y recalcular avance (RF-12). */
  async setProgress(studentId: string, lessonId: number, completed: boolean) {
    const lesson = await this.lessons.findOne({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('Leccion no encontrada');
    const enrollment = await this.enrollments.findOne({ where: { studentId, courseId: lesson.courseId } });
    if (!enrollment) throw new BadRequestException('No estas inscrito a este curso');
    if (enrollment.status === 'COMPLETED') throw new BadRequestException('El curso ya esta completado');

    const existing = await this.progress.findOne({ where: { enrollmentId: enrollment.id, lessonId } });
    if (completed && !existing) {
      await this.progress.save(this.progress.create({ enrollmentId: enrollment.id, lessonId }));
    } else if (!completed && existing) {
      await this.progress.delete({ id: existing.id });
    }

    // RF-27: la finalizacion se evalua tambien al marcar lecciones (la
    // evaluacion pudo aprobarse antes de completar el recorrido).
    await this.completeIfEligible(enrollment);

    return this.progressOf(enrollment);
  }

  async findEnrollment(studentId: string, courseId: number): Promise<EnrollmentEntity> {
    const enrollment = await this.enrollments.findOne({ where: { studentId, courseId } });
    if (!enrollment) throw new BadRequestException('No estas inscrito a este curso');
    return enrollment;
  }

  async progressOf(enrollment: EnrollmentEntity) {
    const total = await this.lessons.count({ where: { courseId: enrollment.courseId } });
    const completed = enrollment.id > 0
      ? await this.progress.count({ where: { enrollmentId: enrollment.id } })
      : 0;
    return {
      completed,
      total,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }

  async markedLessonIds(enrollmentId: number): Promise<number[]> {
    const rows = await this.progress.find({ where: { enrollmentId }, select: ['lessonId'] });
    return rows.map((r) => r.lessonId);
  }

  /** Finalizacion (RF-27): todas las lecciones marcadas y evaluacion aprobada. */
  evaluateCompletion(enrollment: EnrollmentEntity, progress: { completed: number; total: number }): boolean {
    const allLessons = progress.total > 0 && progress.completed >= progress.total;
    const approved = (enrollment.bestScore ?? 0) >= EVALUATION_PASS_SCORE;
    return allLessons && approved;
  }

  async completeIfEligible(enrollment: EnrollmentEntity): Promise<boolean> {
    const fresh = await this.enrollments.findOneOrFail({ where: { id: enrollment.id } });
    const progress = await this.progressOf(fresh);
    if (fresh.status === 'COMPLETED' || !this.evaluateCompletion(fresh, progress)) return false;
    fresh.status = 'COMPLETED';
    fresh.completedAt = new Date();
    await this.enrollments.save(fresh);
    await this.audit.log({ action: 'COURSE_COMPLETED', resourceType: 'ENROLLMENT', resourceId: fresh.id, detail: { studentId: fresh.studentId, courseId: fresh.courseId, bestScore: fresh.bestScore } });
    return true;
  }

  async catalog(): Promise<CourseEntity[]> {
    const all = await this.courses.findAll();
    return all.filter((c) => c.status === 'PUBLISHED');
  }
}
