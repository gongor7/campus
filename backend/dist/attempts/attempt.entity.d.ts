export type AttemptStatus = 'PREPARING' | 'IN_PROGRESS' | 'GRADING' | 'GRADED' | 'GRADING_FAILED';
export declare const ATTEMPT_TRANSITIONS: Record<AttemptStatus, AttemptStatus[]>;
export declare class AttemptEntity {
    id: string;
    enrollmentId: number;
    courseId: number;
    status: AttemptStatus;
    startedAt: Date;
    submittedAt: Date | null;
    score: number | null;
}
