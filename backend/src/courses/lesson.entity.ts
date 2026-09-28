import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CourseEntity } from './course.entity';
import { CourseModuleEntity } from './course-module.entity';

@Entity('lessons')
@Index('ix_lesson_module', ['moduleId', 'position'])
export class LessonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courseId: number;

  @ManyToOne(() => CourseEntity)
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity;

  @Column()
  moduleId: number;

  @ManyToOne(() => CourseModuleEntity, (module) => module.lessons)
  @JoinColumn({ name: 'moduleId' })
  module: CourseModuleEntity;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  objective: string | null;

  /** Contenido de la leccion: generado en Fase B o escrito por el docente. */
  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'int', default: 0 })
  estimatedMinutes: number;

  @Column({ type: 'int' })
  position: number;

  /** Citas de fuente que respaldan la leccion: ["doc.pdf", ...]. */
  @Column({ type: 'jsonb', nullable: true })
  sourceRefs: string[] | null;
}
