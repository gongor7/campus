import { EnrollmentEntity } from './enrollment.entity';
import { LessonEntity } from '../courses/lesson.entity';
export declare class LessonProgressEntity {
    id: number;
    enrollmentId: number;
    enrollment: EnrollmentEntity;
    lessonId: number;
    lesson: LessonEntity;
    completedAt: Date;
}
