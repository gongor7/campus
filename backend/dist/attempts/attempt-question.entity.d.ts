import { AttemptEntity } from './attempt.entity';
import { QuestionEntity } from '../question-banks/question.entity';
export declare class AttemptQuestionEntity {
    id: number;
    attemptId: string;
    attempt: AttemptEntity;
    questionId: number;
    question: QuestionEntity;
    variantCase: string;
    answer: string | null;
    score: number | null;
    feedback: string | null;
}
