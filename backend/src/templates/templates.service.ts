import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemplateEntity, TemplateSection } from './template.entity';

export const ASFI_STANDARD_SECTIONS: TemplateSection[] = [
  { type: 'INTRODUCTION', required: true },
  { type: 'MODULES', required: true, minModules: 2, maxModules: 8, minLessonsPerModule: 2, maxLessonsPerModule: 6 },
  { type: 'PRACTICE', required: true },
  { type: 'EVALUATION', required: true },
  { type: 'CLOSING', required: true },
];

@Injectable()
export class TemplatesService implements OnModuleInit {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    @InjectRepository(TemplateEntity)
    private readonly templates: Repository<TemplateEntity>,
  ) {}

  /** Seed idempotente de la plantilla institucional (SPEC-templates). */
  async onModuleInit(): Promise<void> {
    const existing = await this.templates.findOne({ where: { code: 'ASFI_STANDARD' } });
    if (existing) return;
    await this.templates.save(
      this.templates.create({
        code: 'ASFI_STANDARD',
        name: 'Plantilla institucional ASFI',
        sections: ASFI_STANDARD_SECTIONS,
      }),
    );
    this.logger.log('Plantilla ASFI_STANDARD sembrada');
  }

  findActive(): Promise<TemplateEntity[]> {
    return this.templates.find({ where: { isActive: true }, order: { id: 'ASC' } });
  }

  async findById(id: number): Promise<TemplateEntity> {
    const template = await this.templates.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Plantilla no encontrada');
    return template;
  }

  modulesSection(template: TemplateEntity): TemplateSection {
    const section = template.sections.find((s) => s.type === 'MODULES');
    if (!section) throw new NotFoundException('La plantilla no define seccion MODULES');
    return section;
  }

  requiredSectionTypes(template: TemplateEntity): string[] {
    return template.sections.filter((s) => s.required).map((s) => s.type);
  }
}
