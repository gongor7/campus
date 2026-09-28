import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { AttemptEntity, AttemptStatus } from './attempt.entity';
import { AttemptQuestionEntity } from './attempt-question.entity';
import { EnrollmentEntity } from '../enrollments/enrollment.entity';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { QuestionBanksService } from '../question-banks/question-banks.service';
import { CoursesService } from '../courses/courses.service';
import { AiProviderService } from '../generation/ai-provider.service';
import { AuditService } from '../audit/audit.service';
export declare class AttemptsService {
    private readonly attempts;
    private readonly attemptQuestions;
    private readonly enrollmentRepo;
    private readonly enrollments;
    private readonly banks;
    private readonly courses;
    private readonly ai;
    private readonly audit;
    private readonly cooldownMinutes;
    constructor(attempts: Repository<AttemptEntity>, attemptQuestions: Repository<AttemptQuestionEntity>, enrollmentRepo: Repository<EnrollmentEntity>, enrollments: EnrollmentsService, banks: QuestionBanksService, courses: CoursesService, ai: AiProviderService, audit: AuditService, config: ConfigService);
    start(studentId: string, courseId: number): Promise<{
        id: string;
        courseId: number;
        status: AttemptStatus;
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
    submit(studentId: string, attemptId: string, answers: {
        questionId: number;
        answer: string;
    }[]): Promise<{
        id: string;
        courseId: number;
        status: AttemptStatus;
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
    getAttempt(attemptId: string, studentId: string): Promise<{
        id: string;
        courseId: number;
        status: AttemptStatus;
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
    remainingCooldownMs(studentId: string, courseId: number): Promise<number>;
    private gradeWithRetry;
    private courseContext;
    private loadOwned;
    private setStatus;
}
