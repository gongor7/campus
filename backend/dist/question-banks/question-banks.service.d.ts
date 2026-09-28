import { Repository } from 'typeorm';
import { QuestionBankEntity } from './question-bank.entity';
import { QuestionEntity } from './question.entity';
import { CoursesService } from '../courses/courses.service';
import { SourcesService } from '../sources/sources.service';
import { AuditService } from '../audit/audit.service';
import { AiProviderService } from '../generation/ai-provider.service';
import { CourseGenerationEntity } from '../generation/course-generation.entity';
export interface QuestionDto {
    caseText: string;
    prompt: string;
    expectedConcepts: string[];
    sourceRefs: string[];
    variationTemplate?: {
        variableAspects: string[];
        constraints: string;
    };
}
export declare class QuestionBanksService {
    private readonly banks;
    private readonly questions;
    private readonly courses;
    private readonly sources;
    private readonly audit;
    private readonly ai;
    private readonly generations;
    constructor(banks: Repository<QuestionBankEntity>, questions: Repository<QuestionEntity>, courses: CoursesService, sources: SourcesService, audit: AuditService, ai: AiProviderService, generations: Repository<CourseGenerationEntity>);
    generate(courseId: number): Promise<QuestionBankEntity>;
    findByCourse(courseId: number): Promise<QuestionBankEntity>;
    addQuestion(courseId: number, dto: QuestionDto): Promise<QuestionEntity>;
    updateQuestion(questionId: number, dto: Partial<QuestionDto>): Promise<QuestionEntity>;
    deleteQuestion(questionId: number): Promise<void>;
    approve(courseId: number): Promise<QuestionBankEntity>;
    approvedBankWithQuestions(courseId: number): Promise<QuestionEntity[]>;
    private ensureBank;
    private requireDraftBank;
    private trace;
}
