import { QuestionEntity } from './question.entity';
export type BankStatus = 'DRAFT' | 'APPROVED';
export declare class QuestionBankEntity {
    id: number;
    courseId: number;
    status: BankStatus;
    approvedAt: Date | null;
    createdAt: Date;
    questions: QuestionEntity[];
}
