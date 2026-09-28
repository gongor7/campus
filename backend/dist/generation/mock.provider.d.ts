import { AIProvider, BankInput, GradeInput, GradeOutput, LessonContent, LessonInput, OutlineInput, OutlineProposal, QuestionDraft, VariantInput, VariantOutput } from './ai-provider';
export declare class MockProvider implements AIProvider {
    readonly name = "mock";
    readonly model = "deterministic-v1";
    generateOutline(input: OutlineInput): Promise<OutlineProposal>;
    generateLessonContent(input: LessonInput): Promise<LessonContent>;
    generateQuestionBank(input: BankInput): Promise<{
        questions: QuestionDraft[];
    }>;
    generateVariants(input: VariantInput): Promise<VariantOutput>;
    gradeAnswer(input: GradeInput): Promise<GradeOutput>;
}
