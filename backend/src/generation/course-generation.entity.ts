import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type GenerationPhase = 'OUTLINE' | 'LESSON' | 'QUESTIONS' | 'GRADING';
export type GenerationStatus = 'SUCCESS' | 'ERROR';

/**
 * Trazabilidad de cada generacion (PROMPT-MAESTRO seccion 12): quien, cuando,
 * que proveedor y modelo, y con que resultado.
 */
@Entity('course_generations')
@Index('ix_generation_course', ['courseId'])
export class CourseGenerationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courseId: number;

  @Column({ type: 'varchar', length: 20 })
  phase: GenerationPhase;

  @Column({ type: 'int', nullable: true })
  lessonId: number | null;

  @Column({ length: 50 })
  provider: string;

  @Column({ length: 100, default: '' })
  model: string;

  @Column({ default: 'docente' })
  actor: string;

  @Column({ type: 'varchar', length: 20 })
  status: GenerationStatus;

  @Column({ type: 'int', default: 0 })
  durationMs: number;

  @Column({ type: 'jsonb', nullable: true })
  inputSummary: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
