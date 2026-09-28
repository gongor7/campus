import { EnrollmentsService } from './enrollments.service';
import { StudentsService } from '../students/students.service';
declare class SetProgressDto {
    completed: boolean;
}
export declare class EnrollmentsController {
    private readonly enrollments;
    private readonly students;
    constructor(enrollments: EnrollmentsService, students: StudentsService);
    catalog(): Promise<import("../courses/course.entity").CourseEntity[]>;
    enroll(studentId: string, courseId: number): Promise<import("./enrollment.entity").EnrollmentEntity>;
    myCourses(studentId: string): Promise<{
        enrollmentId: number;
        courseId: number;
        title: string;
        level: import("../courses/course.entity").CourseLevel;
        targetHours: number;
        courseStatus: import("../courses/course.entity").CourseStatus;
        status: import("./enrollment.entity").EnrollmentStatus;
        bestScore: number | null;
        evaluationApproved: boolean;
        completedLessons: number;
        totalLessons: number;
        percent: number;
    }[]>;
    courseForStudent(studentId: string, courseId: number): Promise<{
        course: import("../courses/course.entity").CourseEntity;
        enrollment: {
            id: number;
            status: import("./enrollment.entity").EnrollmentStatus;
            bestScore: number | null;
            evaluationApproved: boolean;
            completedAt: Date | null;
        } | null;
        progress: {
            completed: number;
            total: number;
            percent: number;
        };
        markedLessonIds: number[];
    }>;
    setProgress(studentId: string, lessonId: number, dto: SetProgressDto): Promise<{
        completed: number;
        total: number;
        percent: number;
    }>;
}
export {};
