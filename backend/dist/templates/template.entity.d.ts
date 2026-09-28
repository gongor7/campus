import { CourseEntity } from '../courses/course.entity';
export interface TemplateSection {
    type: 'INTRODUCTION' | 'MODULES' | 'PRACTICE' | 'EVALUATION' | 'CLOSING';
    required: boolean;
    minModules?: number;
    maxModules?: number;
    minLessonsPerModule?: number;
    maxLessonsPerModule?: number;
}
export declare class TemplateEntity {
    id: number;
    code: string;
    name: string;
    sections: TemplateSection[];
    isActive: boolean;
    createdAt: Date;
    courses: CourseEntity[];
}
