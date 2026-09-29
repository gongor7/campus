import { ConfigService } from '@nestjs/config';
import { AIProvider } from './ai-provider';
import { MockProvider } from './mock.provider';
import { GeminiProvider } from './gemini.provider';
import { SettingsService } from '../settings/settings.service';
export declare class AiProviderService {
    private readonly mock;
    private readonly gemini;
    private readonly settings;
    private readonly config;
    constructor(mock: MockProvider, gemini: GeminiProvider, settings: SettingsService, config: ConfigService);
    get provider(): AIProvider;
    get name(): string;
    get model(): string;
}
