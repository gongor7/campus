import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TemplateEntity } from '../templates/template.entity';
import { SourceSetEntity } from '../sources/source-set.entity';
import { CourseModuleEntity } from './course-module.entity';
import { CourseSectionEntity } from './course-section.entity';

export type CourseLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
export type CourseStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';

@Entity('courses')
export class CourseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'text', default: '' })
  objective: string;

  @Column({ length: 200, default: '' })
  audience: string;

  @Column({ type: 'varchar', length: 20 })
  level: CourseLevel;

  /** Duracion objetivo del curso en horas. */
  @Column({ type: 'int' })
  targetHours: number;

  @Column()
  templateId: number;

  @ManyToOne(() => TemplateEntity, (template) => template.courses)
  @JoinColumn({ name: 'templateId' })
  template: TemplateEntity;

  @Column({ type: 'int', nullable: true })
  @Index()
  sourceSetId: number | null;

  @ManyToOne(() => SourceSetEntity, { nullable: true })
  @JoinColumn({ name: 'sourceSetId' })
  sourceSet: SourceSetEntity | null;

  @Column({ type: 'varchar', length: 20, default: 'DRAFT' })
  status: CourseStatus;

  @Column({ default: 'docente' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CourseModuleEntity, (m) => m.course)
  modules: CourseModuleEntity[];

  @OneToMany(() => CourseSectionEntity, (s) => s.course)
  sections: CourseSectionEntity[];
}
