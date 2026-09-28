import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider } from './ai-provider';
import { MockProvider } from './mock.provider';
import { GeminiProvider } from './gemini.provider';

/**
 * Punto unico de seleccion del proveedor de IA (decision D-7 del plan):
 * todos los modulos inyectan este servicio, nunca un proveedor concreto.
 */
@Injectable()
export class AiProviderService {
  readonly provider: AIProvider;

  constructor(mock: MockProvider, gemini: GeminiProvider, config: ConfigService) {
    const preferred = config.get<string>('AI_PROVIDER', 'gemini');
    const hasKey = Boolean(config.get<string>('GEMINI_API_KEY'));
    this.provider = preferred === 'mock' || !hasKey ? mock : gemini;
  }

  get name(): string {
    return this.provider.name;
  }

  get model(): string {
    return this.provider.model;
  }
}
