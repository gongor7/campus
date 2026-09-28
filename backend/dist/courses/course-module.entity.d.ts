import { CourseEntity } from './course.entity';
import { LessonEntity } from './lesson.entity';
export declare class CourseModuleEntity {
    id: number;
    courseId: number;
    course: CourseEntity;
    title: string;
    objective: string | null;
    position: number;
    estimatedMinutes: number;
    lessons: LessonEntity[];
}
