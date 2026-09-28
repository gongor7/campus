import { Injectable } from '@nestjs/common';
import { TemplateEntity } from './template.entity';
import { TemplatesService } from './templates.service';

export interface OutlineLike {
  modules: { title: string; lessons: { title: string }[] }[];
  sections: { type: string }[];
}

/**
 * Valida una estructura de curso contra las restricciones de la plantilla
 * institucional (min/max modulos y lecciones, secciones requeridas).
 */
@Injectable()
export class TemplateValidatorService {
  constructor(private readonly templates: TemplatesService) {}

  validate(outline: OutlineLike, template: TemplateEntity): string[] {
    const errors: string[] = [];
    const modulesSection = template.sections.find((s) => s.type === 'MODULES');

    const moduleCount = outline.modules.length;
    if (modulesSection?.minModules !== undefined && moduleCount < modulesSection.minModules) {
      errors.push(`La plantilla exige al menos ${modulesSection.minModules} modulos; hay ${moduleCount}.`);
    }
    if (modulesSection?.maxModules !== undefined && moduleCount > modulesSection.maxModules) {
      errors.push(`La plantilla admite como maximo ${modulesSection.maxModules} modulos; hay ${moduleCount}.`);
    }

    outline.modules.forEach((module, i) => {
      const lessons = module.lessons.length;
      if (modulesSection?.minLessonsPerModule !== undefined && lessons < modulesSection.minLessonsPerModule) {
        errors.push(`El modulo ${i + 1} tiene ${lessons} lecciones; minimo ${modulesSection.minLessonsPerModule}.`);
      }
      if (modulesSection?.maxLessonsPerModule !== undefined && lessons > modulesSection.maxLessonsPerModule) {
        errors.push(`El modulo ${i + 1} tiene ${lessons} lecciones; maximo ${modulesSection.maxLessonsPerModule}.`);
      }
      if (!module.title.trim()) errors.push(`El modulo ${i + 1} no tiene titulo.`);
    });

    const present = new Set(outline.sections.map((s) => s.type));
    for (const required of this.templates.requiredSectionTypes(template)) {
      if (required === 'MODULES') continue; // cubierto arriba
      if (!present.has(required)) errors.push(`Falta la seccion requerida ${required}.`);
    }

    return errors;
  }
}
