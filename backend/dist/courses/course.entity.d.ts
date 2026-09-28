import { TemplateEntity } from '../templates/template.entity';
import { SourceSetEntity } from '../sources/source-set.entity';
import { CourseModuleEntity } from './course-module.entity';
import { CourseSectionEntity } from './course-section.entity';
export type CourseLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
export type CourseStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export declare class CourseEntity {
    id: number;
    title: string;
    description: string;
    objective: string;
    audience: string;
    level: CourseLevel;
    targetHours: number;
    templateId: number;
    template: TemplateEntity;
    sourceSetId: number | null;
    sourceSet: SourceSetEntity | null;
    status: CourseStatus;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    modules: CourseModuleEntity[];
    sections: CourseSectionEntity[];
}
