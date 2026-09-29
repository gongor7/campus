import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AppSettingEntity } from './app-setting.entity';
export interface AiSettingsSnapshot {
    geminiApiKey: string | null;
    forceMock: boolean;
}
export declare class SettingsService implements OnModuleInit {
    private readonly settings;
    private readonly logger;
    private cache;
    constructor(settings: Repository<AppSettingEntity>);
    onModuleInit(): Promise<void>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string | null): Promise<void>;
    snapshot(): AiSettingsSnapshot;
    aiSnapshot(): Promise<AiSettingsSnapshot>;
    mask(key: string | null): string | null;
}
