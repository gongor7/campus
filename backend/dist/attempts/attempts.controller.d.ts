import { AttemptsService } from './attempts.service';
import { StudentsService } from '../students/students.service';
declare class SubmitAnswerDto {
    questionId: number;
    answer: string;
}
declare class SubmitAttemptDto {
    answers: SubmitAnswerDto[];
}
export declare class AttemptsController {
    private readonly attempts;
    private readonly students;
    constructor(attempts: AttemptsService, students: StudentsService);
    start(studentId: string, courseId: number): Promise<{
        id: string;
        courseId: number;
        status: import("./attempt.entity").AttemptStatus;
        startedAt: Date;
        submittedAt: Date | null;
        score: number | null;
        passScore: number;
        questions: {
            questionId: number;
            prompt: string;
            variantCase: string;
            answer: string | null;
            score: number | null;
            feedback: string | null;
        }[];
    }>;
    submit(studentId: string, attemptId: string, dto: SubmitAttemptDto): Promise<{
        id: string;
        courseId: number;
        status: import("./attempt.entity").AttemptStatus;
        startedAt: Date;
        submittedAt: Date | null;
        score: number | null;
        passScore: number;
        questions: {
            questionId: number;
            prompt: string;
            variantCase: string;
            answer: string | null;
            score: number | null;
            feedback: string | null;
        }[];
    }>;
    getAttempt(studentId: string, attemptId: string): Promise<{
        id: string;
        courseId: number;
        status: import("./attempt.entity").AttemptStatus;
        startedAt: Date;
        submittedAt: Date | null;
        score: number | null;
        passScore: number;
        questions: {
            questionId: number;
            prompt: string;
            variantCase: string;
            answer: string | null;
            score: number | null;
            feedback: string | null;
        }[];
    }>;
    history(studentId: string, courseId: number): Promise<{
        id: string;
        submittedAt: Date | null;
        score: number | null;
        approved: boolean;
    }[]>;
}
export {};
