import { ConfigService } from '@nestjs/config';
import { AIProvider } from './ai-provider';
import { MockProvider } from './mock.provider';
import { GeminiProvider } from './gemini.provider';
export declare class AiProviderService {
    readonly provider: AIProvider;
    constructor(mock: MockProvider, gemini: GeminiProvider, config: ConfigService);
    get name(): string;
    get model(): string;
}
