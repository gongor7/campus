import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EnrollmentEntity } from './enrollment.entity';
import { LessonEntity } from '../courses/lesson.entity';

/** Marcar/desmarcar una leccion = insertar/eliminar fila (decision D-2). */
@Entity('lesson_progress')
@Index('uq_progress_enrollment_lesson', ['enrollmentId', 'lessonId'])
export class LessonProgressEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  enrollmentId: number;

  @ManyToOne(() => EnrollmentEntity)
  @JoinColumn({ name: 'enrollmentId' })
  enrollment: EnrollmentEntity;

  @Column()
  lessonId: number;

  @ManyToOne(() => LessonEntity)
  @JoinColumn({ name: 'lessonId' })
  lesson: LessonEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  completedAt: Date;
}
