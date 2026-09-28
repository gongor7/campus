import { AIProvider, LessonContent, LessonInput, OutlineInput, OutlineProposal } from './ai-provider';
export declare class MockProvider implements AIProvider {
    readonly name = "mock";
    readonly model = "deterministic-v1";
    generateOutline(input: OutlineInput): Promise<OutlineProposal>;
    generateLessonContent(input: LessonInput): Promise<LessonContent>;
}
