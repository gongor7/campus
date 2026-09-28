import { ConfigService } from '@nestjs/config';
import { AIProvider, LessonContent, LessonInput, OutlineInput, OutlineProposal } from './ai-provider';
export declare class GeminiProvider implements AIProvider {
    private readonly config;
    private readonly logger;
    readonly name = "gemini";
    constructor(config: ConfigService);
    get model(): string;
    generateOutline(input: OutlineInput): Promise<OutlineProposal>;
    generateLessonContent(input: LessonInput): Promise<LessonContent>;
    private call;
    private expectShape;
}
