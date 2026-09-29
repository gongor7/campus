import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSettingEntity } from './app-setting.entity';

export interface AiSettingsSnapshot {
  geminiApiKey: string | null;
  geminiModel: string | null;
  forceMock: boolean;
}

/**
 * Configuracion editable en runtime (pestana Configuracion). La API key se
 * guarda en la base de datos (nunca en el codigo ni en el repositorio), se
 * muestra enmascarada y jamas se devuelve por la API. Mientras no exista auth,
 * cambiarla es visible en auditoria (sin el valor).
 */
@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);
  private cache = new Map<string, string | null>();

  constructor(
    @InjectRepository(AppSettingEntity)
    private readonly settings: Repository<AppSettingEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    const rows = await this.settings.find();
    this.cache = new Map(rows.map((r) => [r.key, r.value]));
    this.logger.log(`Configuracion cargada (${rows.length} valores)`);
  }

  async get(key: string): Promise<string | null> {
    if (this.cache.has(key)) return this.cache.get(key) ?? null;
    const row = await this.settings.findOne({ where: { key } });
    const value = row?.value ?? null;
    this.cache.set(key, value);
    return value;
  }

  async set(key: string, value: string | null): Promise<void> {
    const existing = await this.settings.findOne({ where: { key } });
    if (existing) {
      existing.value = value;
      await this.settings.save(existing);
    } else {
      await this.settings.save(this.settings.create({ key, value }));
    }
    this.cache.set(key, value);
  }

  /** Lectura sincronica para seleccion de proveedor en caliente. */
  snapshot(): AiSettingsSnapshot {
    return {
      geminiApiKey: this.cache.get('GEMINI_API_KEY') ?? null,
      geminiModel: this.cache.get('GEMINI_MODEL') ?? null,
      forceMock: (this.cache.get('AI_FORCE_MOCK') ?? 'false') === 'true',
    };
  }

  async aiSnapshot(): Promise<AiSettingsSnapshot> {
    return {
      geminiApiKey: await this.get('GEMINI_API_KEY'),
      geminiModel: await this.get('GEMINI_MODEL'),
      forceMock: (await this.get('AI_FORCE_MOCK')) === 'true',
    };
  }

  mask(key: string | null): string | null {
    if (!key) return null;
    return `••••••••${key.slice(-4)}`;
  }
}
