import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CourseEntity } from './course.entity';

export type CourseSectionType = 'INTRODUCTION' | 'PRACTICE' | 'EVALUATION' | 'CLOSING';

@Entity('course_sections')
export class CourseSectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courseId: number;

  @ManyToOne(() => CourseEntity, (course) => course.sections)
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity;

  @Column({ type: 'varchar', length: 20 })
  type: CourseSectionType;

  @Column({ length: 200, default: '' })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'int' })
  position: number;
}
