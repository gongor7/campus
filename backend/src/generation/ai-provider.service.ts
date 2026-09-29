import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider } from './ai-provider';
import { MockProvider } from './mock.provider';
import { GeminiProvider } from './gemini.provider';
import { SettingsService } from '../settings/settings.service';

/**
 * Punto unico de seleccion del proveedor de IA (decision D-7 del plan).
 * La seleccion es dinamica en cada acceso:
 *   1. AI_PROVIDER=mock (env) o forceMock (pestana Configuracion) -> mock
 *   2. API key en Configuracion (base de datos) o GEMINI_API_KEY (env) -> gemini
 *   3. sin key -> mock (modo seguro, sin red)
 */
@Injectable()
export class AiProviderService {
  constructor(
    private readonly mock: MockProvider,
    private readonly gemini: GeminiProvider,
    private readonly settings: SettingsService,
    private readonly config: ConfigService,
  ) {}

  get provider(): AIProvider {
    const snapshot = this.settings.snapshot();
    const envProvider = process.env.AI_PROVIDER ?? this.config.get<string>('AI_PROVIDER') ?? 'gemini';
    if (envProvider === 'mock' || snapshot.forceMock) return this.mock;
    if (snapshot.geminiApiKey || this.config.get<string>('GEMINI_API_KEY')) return this.gemini;
    return this.mock;
  }

  get name(): string {
    return this.provider.name;
  }

  get model(): string {
    return this.provider.model;
  }
}
