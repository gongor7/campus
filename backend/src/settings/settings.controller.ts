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
      geminiConfigured: Boolean(snapshot.geminiApiKey),
      maskedKey: this.settings.mask(snapshot.geminiApiKey),
      forceMock: snapshot.forceMock,
    };
  }

  @Put('ai')
  async update(@Body() dto: UpdateAiSettingsDto) {
    if (dto.geminiApiKey !== undefined) {
      const key = dto.geminiApiKey === null || dto.geminiApiKey.trim() === '' ? null : dto.geminiApiKey.trim();
      await this.settings.set('GEMINI_API_KEY', key);
    }
    if (dto.forceMock !== undefined) {
      await this.settings.set('AI_FORCE_MOCK', dto.forceMock ? 'true' : 'false');
    }
    await this.audit.log({
      action: 'SETTINGS_UPDATED',
      resourceType: 'SETTINGS',
      resourceId: 'ai',
      detail: { geminiKeyChanged: dto.geminiApiKey !== undefined, forceMock: dto.forceMock }, // nunca el valor
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
