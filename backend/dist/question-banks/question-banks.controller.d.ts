import { QuestionBanksService } from './question-banks.service';
declare class QuestionDto {
    caseText: string;
    prompt: string;
    expectedConcepts: string[];
    sourceRefs: string[];
    variationTemplate?: {
        variableAspects: string[];
        constraints: string;
    };
}
declare class UpdateQuestionDto {
    caseText?: string;
    prompt?: string;
    expectedConcepts?: string[];
    sourceRefs?: string[];
    variationTemplate?: {
        variableAspects: string[];
        constraints: string;
    };
}
export declare class QuestionBanksController {
    private readonly banks;
    constructor(banks: QuestionBanksService);
    generate(id: number): Promise<import("./question-bank.entity").QuestionBankEntity>;
    findByCourse(id: number): Promise<import("./question-bank.entity").QuestionBankEntity>;
    addQuestion(id: number, dto: QuestionDto): Promise<import("./question.entity").QuestionEntity>;
    updateQuestion(questionId: number, dto: UpdateQuestionDto): Promise<import("./question.entity").QuestionEntity>;
    deleteQuestion(questionId: number): Promise<void>;
    approve(id: number): Promise<import("./question-bank.entity").QuestionBankEntity>;
}
export {};
