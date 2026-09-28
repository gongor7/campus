import { StudentEntity } from '../students/student.entity';
import { CourseEntity } from '../courses/course.entity';
export type EnrollmentStatus = 'IN_PROGRESS' | 'COMPLETED';
export declare class EnrollmentEntity {
    id: number;
    studentId: string;
    student: StudentEntity;
    courseId: number;
    course: CourseEntity;
    status: EnrollmentStatus;
    bestScore: number | null;
    startedAt: Date;
    updatedAt: Date;
    completedAt: Date | null;
}
