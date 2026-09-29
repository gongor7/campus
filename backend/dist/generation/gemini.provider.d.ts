import { SettingsService } from '../settings/settings.service';
import { ConfigService } from '@nestjs/config';
import { AIProvider, BankInput, GradeInput, GradeOutput, LessonContent, LessonInput, OutlineInput, OutlineProposal, QuestionDraft, VariantInput, VariantOutput } from './ai-provider';
export declare class GeminiProvider implements AIProvider {
    private readonly config;
    private readonly settings;
    private readonly logger;
    readonly name = "gemini";
    constructor(config: ConfigService, settings: SettingsService);
    get model(): string;
    generateOutline(input: OutlineInput): Promise<OutlineProposal>;
    generateLessonContent(input: LessonInput): Promise<LessonContent>;
    generateQuestionBank(input: BankInput): Promise<{
        questions: QuestionDraft[];
    }>;
    generateVariants(input: VariantInput): Promise<VariantOutput>;
    gradeAnswer(input: GradeInput): Promise<GradeOutput>;
    ping(): Promise<string>;
    private currentKey;
    private call;
    private expectShape;
}
