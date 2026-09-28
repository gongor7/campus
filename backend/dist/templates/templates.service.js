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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TemplatesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesService = exports.ASFI_STANDARD_SECTIONS = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const template_entity_1 = require("./template.entity");
exports.ASFI_STANDARD_SECTIONS = [
    { type: 'INTRODUCTION', required: true },
    { type: 'MODULES', required: true, minModules: 2, maxModules: 8, minLessonsPerModule: 2, maxLessonsPerModule: 6 },
    { type: 'PRACTICE', required: true },
    { type: 'EVALUATION', required: true },
    { type: 'CLOSING', required: true },
];
let TemplatesService = TemplatesService_1 = class TemplatesService {
    constructor(templates) {
        this.templates = templates;
        this.logger = new common_1.Logger(TemplatesService_1.name);
    }
    async onModuleInit() {
        const existing = await this.templates.findOne({ where: { code: 'ASFI_STANDARD' } });
        if (existing)
            return;
        await this.templates.save(this.templates.create({
            code: 'ASFI_STANDARD',
            name: 'Plantilla institucional ASFI',
            sections: exports.ASFI_STANDARD_SECTIONS,
        }));
        this.logger.log('Plantilla ASFI_STANDARD sembrada');
    }
    findActive() {
        return this.templates.find({ where: { isActive: true }, order: { id: 'ASC' } });
    }
    async findById(id) {
        const template = await this.templates.findOne({ where: { id } });
        if (!template)
            throw new common_1.NotFoundException('Plantilla no encontrada');
        return template;
    }
    modulesSection(template) {
        const section = template.sections.find((s) => s.type === 'MODULES');
        if (!section)
            throw new common_1.NotFoundException('La plantilla no define seccion MODULES');
        return section;
    }
    requiredSectionTypes(template) {
        return template.sections.filter((s) => s.required).map((s) => s.type);
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = TemplatesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(template_entity_1.TemplateEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TemplatesService);
