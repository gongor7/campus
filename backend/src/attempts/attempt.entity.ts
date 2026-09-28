import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type AttemptStatus = 'PREPARING' | 'IN_PROGRESS' | 'GRADING' | 'GRADED' | 'GRADING_FAILED';

/** Transiciones validas de la maquina de estados del intento (T11). */
export const ATTEMPT_TRANSITIONS: Record<AttemptStatus, AttemptStatus[]> = {
  PREPARING: ['IN_PROGRESS', 'GRADING_FAILED'],
  IN_PROGRESS: ['GRADING', 'GRADING_FAILED'],
  GRADING: ['GRADED', 'GRADING_FAILED'],
  GRADED: [],
  GRADING_FAILED: [],
};

@Entity('attempts')
@Index('ix_attempt_enrollment', ['enrollmentId'])
export class AttemptEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  enrollmentId: number;

  @Column()
  courseId: number;

  @Column({ type: 'varchar', length: 20 })
  status: AttemptStatus;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date | null;

  /** Promedio 0-100 de las preguntas (RF-21). */
  @Column({ type: 'int', nullable: true })
  score: number | null;
}
