import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CourseEntity } from './course.entity';
import { LessonEntity } from './lesson.entity';

@Entity('course_modules')
export class CourseModuleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courseId: number;

  @ManyToOne(() => CourseEntity, (course) => course.modules)
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  objective: string | null;

  @Column({ type: 'int' })
  position: number;

  @Column({ type: 'int', default: 0 })
  estimatedMinutes: number;

  @OneToMany(() => LessonEntity, (lesson) => lesson.module)
  lessons: LessonEntity[];
}
