import { Repository } from 'typeorm';
import { EnrollmentEntity } from './enrollment.entity';
import { LessonProgressEntity } from './lesson-progress.entity';
import { LessonEntity } from '../courses/lesson.entity';
import { CoursesService } from '../courses/courses.service';
import { AuditService } from '../audit/audit.service';
import { CourseEntity } from '../courses/course.entity';
export declare const EVALUATION_PASS_SCORE = 70;
export declare class EnrollmentsService {
    private readonly enrollments;
    private readonly progress;
    private readonly lessons;
    private readonly courses;
    private readonly audit;
    constructor(enrollments: Repository<EnrollmentEntity>, progress: Repository<LessonProgressEntity>, lessons: Repository<LessonEntity>, courses: CoursesService, audit: AuditService);
    enroll(studentId: string, courseId: number): Promise<EnrollmentEntity>;
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
        course: CourseEntity;
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
    setProgress(studentId: string, lessonId: number, completed: boolean): Promise<{
        completed: number;
        total: number;
        percent: number;
    }>;
    findEnrollment(studentId: string, courseId: number): Promise<EnrollmentEntity>;
    progressOf(enrollment: EnrollmentEntity): Promise<{
        completed: number;
        total: number;
        percent: number;
    }>;
    markedLessonIds(enrollmentId: number): Promise<number[]>;
    evaluateCompletion(enrollment: EnrollmentEntity, progress: {
        completed: number;
        total: number;
    }): boolean;
    completeIfEligible(enrollment: EnrollmentEntity): Promise<boolean>;
    catalog(): Promise<CourseEntity[]>;
}
