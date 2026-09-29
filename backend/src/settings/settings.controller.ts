import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { SettingsService } from './settings.service';
import { AiProviderService } from '../generation/ai-provider.service';
import { GeminiProvider } from '../generation/gemini.provider';
import { AuditService } from '../audit/audit.service';

class UpdateAiSettingsDto {
  /** API key de Gemini; null la elimina. Nunca se devuelve por la API. */
  @IsOptional() @IsString() @MaxLength(200)
  geminiApiKey?: string | null;

  @IsOptional() @IsString() @MaxLength(100)
  geminiModel?: string | null;

  @IsOptional() @IsBoolean()
  forceMock?: boolean;
}

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settings: SettingsService,
    private readonly ai: AiProviderService,
    private readonly gemini: GeminiProvider,
    private readonly audit: AuditService,
  ) {}

  @Get('ai')
  async status() {
    const snapshot = await this.settings.aiSnapshot();
    return {
      provider: this.ai.provider.name,
      model: this.ai.provider.model,
      modelSource: snapshot.geminiModel ? 'configuracion' : 'predeterminado',
      geminiConfigured: Boolean(snapshot.geminiApiKey),
      maskedKey: this.settings.mask(snapshot.geminiApiKey),
      forceMock: snapshot.forceMock,
    };
  }

  /** Modelos con generateContent disponibles para la key configurada. */
  @Get('ai/models')
  async models() {
    const snapshot = await this.settings.aiSnapshot();
    if (!snapshot.geminiApiKey) return { models: [] as string[] };
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${snapshot.geminiApiKey}&pageSize=100`,
      );
      if (!res.ok) return { models: [], error: `No se pudo listar modelos (HTTP ${res.status})` };
      const data = (await res.json()) as {
        models?: { name: string; supportedGenerationMethods?: string[] }[];
      };
      const models = (data.models ?? [])
        .filter((m) => (m.supportedGenerationMethods ?? []).includes('generateContent'))
        .filter((m) => !/tts|image|transcribe|computer-use|lyria|robotics|banana|clip|deep-research|omni|antigravity|customtools/i.test(m.name))
        .map((m) => m.name.replace('models/', ''))
        .sort();
      return { models };
    } catch (error) {
      return { models: [], error: (error as Error).message };
    }
  }

  @Put('ai')
  async update(@Body() dto: UpdateAiSettingsDto) {
    if (dto.geminiApiKey !== undefined) {
      const key = dto.geminiApiKey === null || dto.geminiApiKey.trim() === '' ? null : dto.geminiApiKey.trim();
      await this.settings.set('GEMINI_API_KEY', key);
    }
    if (dto.geminiModel !== undefined) {
      const model = dto.geminiModel === null || dto.geminiModel.trim() === '' ? null : dto.geminiModel.trim();
      await this.settings.set('GEMINI_MODEL', model);
    }
    if (dto.forceMock !== undefined) {
      await this.settings.set('AI_FORCE_MOCK', dto.forceMock ? 'true' : 'false');
    }
    await this.audit.log({
      action: 'SETTINGS_UPDATED',
      resourceType: 'SETTINGS',
      resourceId: 'ai',
      detail: { geminiKeyChanged: dto.geminiApiKey !== undefined, geminiModel: dto.geminiModel ?? undefined, forceMock: dto.forceMock },
    });
    return this.status();
  }

  /** Prueba real de conectividad con la key configurada (prompt minimo). */
  @Post('ai/test')
  async test() {
    try {
      const answer = await this.gemini.ping();
      return { ok: true, message: answer };
    } catch (error) {
      return { ok: false, message: (error as Error).message };
    }
  }
}
