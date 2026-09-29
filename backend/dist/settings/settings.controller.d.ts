import { SettingsService } from './settings.service';
import { AiProviderService } from '../generation/ai-provider.service';
import { GeminiProvider } from '../generation/gemini.provider';
import { AuditService } from '../audit/audit.service';
declare class UpdateAiSettingsDto {
    geminiApiKey?: string | null;
    geminiModel?: string | null;
    forceMock?: boolean;
}
export declare class SettingsController {
    private readonly settings;
    private readonly ai;
    private readonly gemini;
    private readonly audit;
    constructor(settings: SettingsService, ai: AiProviderService, gemini: GeminiProvider, audit: AuditService);
    status(): Promise<{
        provider: string;
        model: string;
        modelSource: string;
        geminiConfigured: boolean;
        maskedKey: string | null;
        forceMock: boolean;
    }>;
    models(): Promise<{
        models: string[];
        error?: undefined;
    } | {
        models: never[];
        error: string;
    }>;
    update(dto: UpdateAiSettingsDto): Promise<{
        provider: string;
        model: string;
        modelSource: string;
        geminiConfigured: boolean;
        maskedKey: string | null;
        forceMock: boolean;
    }>;
    test(): Promise<{
        ok: boolean;
        message: string;
    }>;
}
export {};
