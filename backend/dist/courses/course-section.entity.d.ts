import { CourseEntity } from './course.entity';
export type CourseSectionType = 'INTRODUCTION' | 'PRACTICE' | 'EVALUATION' | 'CLOSING';
export declare class CourseSectionEntity {
    id: number;
    courseId: number;
    course: CourseEntity;
    type: CourseSectionType;
    title: string;
    content: string | null;
    position: number;
}
