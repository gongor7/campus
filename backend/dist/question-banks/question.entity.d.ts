import { QuestionBankEntity } from './question-bank.entity';
export interface VariationTemplate {
    variableAspects: string[];
    constraints: string;
}
export declare class QuestionEntity {
    id: number;
    bankId: number;
    bank: QuestionBankEntity;
    position: number;
    caseText: string;
    prompt: string;
    expectedConcepts: string[];
    sourceRefs: string[];
    variationTemplate: VariationTemplate;
    createdAt: Date;
}
