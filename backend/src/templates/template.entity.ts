import { Column, CreateDateColumn, Entity, OneToMany } from 'typeorm';
import { CourseEntity } from '../courses/course.entity';

export interface TemplateSection {
  type: 'INTRODUCTION' | 'MODULES' | 'PRACTICE' | 'EVALUATION' | 'CLOSING';
  required: boolean;
  minModules?: number;
  maxModules?: number;
  minLessonsPerModule?: number;
  maxLessonsPerModule?: number;
}

@Entity('course_templates')
export class TemplateEntity {
  @Column({ primary: true, generated: true })
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'jsonb' })
  sections: TemplateSection[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => CourseEntity, (course) => course.template)
  courses: CourseEntity[];
}
