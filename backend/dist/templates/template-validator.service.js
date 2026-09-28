"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateValidatorService = void 0;
const common_1 = require("@nestjs/common");
const templates_service_1 = require("./templates.service");
let TemplateValidatorService = class TemplateValidatorService {
    constructor(templates) {
        this.templates = templates;
    }
    validate(outline, template) {
        const errors = [];
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
            if (!module.title.trim())
                errors.push(`El modulo ${i + 1} no tiene titulo.`);
        });
        const present = new Set(outline.sections.map((s) => s.type));
        for (const required of this.templates.requiredSectionTypes(template)) {
            if (required === 'MODULES')
                continue;
            if (!present.has(required))
                errors.push(`Falta la seccion requerida ${required}.`);
        }
        return errors;
    }
};
exports.TemplateValidatorService = TemplateValidatorService;
exports.TemplateValidatorService = TemplateValidatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [templates_service_1.TemplatesService])
], TemplateValidatorService);
