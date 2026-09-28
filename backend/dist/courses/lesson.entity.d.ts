import { CourseEntity } from './course.entity';
import { CourseModuleEntity } from './course-module.entity';
export declare class LessonEntity {
    id: number;
    courseId: number;
    course: CourseEntity;
    moduleId: number;
    module: CourseModuleEntity;
    title: string;
    objective: string | null;
    content: string | null;
    estimatedMinutes: number;
    position: number;
    sourceRefs: string[] | null;
}
