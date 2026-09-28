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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const course_generation_entity_1 = require("./course-generation.entity");
const mock_provider_1 = require("./mock.provider");
const gemini_provider_1 = require("./gemini.provider");
const courses_service_1 = require("../courses/courses.service");
const sources_service_1 = require("../sources/sources.service");
const storage_service_1 = require("../sources/storage.service");
const templates_service_1 = require("../templates/templates.service");
const template_validator_service_1 = require("../templates/template-validator.service");
const audit_service_1 = require("../audit/audit.service");
const lesson_entity_1 = require("../courses/lesson.entity");
let GenerationService = class GenerationService {
    constructor(generations, lessonsRepo, courses, sources, storage, templates, validator, audit, mock, gemini, config) {
        this.generations = generations;
        this.lessonsRepo = lessonsRepo;
        this.courses = courses;
        this.sources = sources;
        this.storage = storage;
        this.templates = templates;
        this.validator = validator;
        this.audit = audit;
        const preferred = config.get('AI_PROVIDER', 'gemini');
        const hasKey = Boolean(config.get('GEMINI_API_KEY'));
        this.provider = preferred === 'mock' || !hasKey ? mock : gemini;
    }
    async generateOutline(courseId) {
        const course = await this.courses.findById(courseId);
        if (!course.sourceSetId) {
            throw new common_1.BadRequestException('El curso no tiene un cuaderno de fuentes vinculado');
        }
        const started = Date.now();
        try {
            const files = await this.sources.readSetFiles(course.sourceSetId);
            const template = course.template ?? (await this.templates.findById(course.templateId));
            const proposal = await this.provider.generateOutline({
                course: this.courseContext(course),
                templateSections: template.sections,
                sources: files,
            });
            const errors = this.validator.validate({
                modules: proposal.modules.map((m) => ({
                    title: m.title,
                    lessons: m.lessons.map((l) => ({ title: l.title })),
                })),
                sections: proposal.sections.map((s) => ({ type: s.type })),
            }, template);
            if (errors.length > 0) {
                throw new common_1.BadGatewayException(['La propuesta de IA no cumple la plantilla institucional:', ...errors].join(' '));
            }
            await this.trace(courseId, 'OUTLINE', null, started, 'SUCCESS', {
                provider: this.provider.name,
                sources: files.length,
                modules: proposal.modules.length,
            });
            await this.audit.log({
                action: 'GENERATION_OUTLINE',
                resourceType: 'COURSE',
                resourceId: courseId,
                detail: { provider: this.provider.name, modules: proposal.modules.length },
            });
            await this.courses.replaceOutline(courseId, this.proposalToDto(proposal));
            return proposal;
        }
        catch (error) {
            await this.trace(courseId, 'OUTLINE', null, started, 'ERROR', {
                provider: this.provider.name,
                message: error.message,
            });
            throw error;
        }
    }
    async generateLesson(lessonId) {
        const lesson = await this.lessonsRepo.findOne({ where: { id: lessonId } });
        if (!lesson)
            throw new common_1.BadRequestException('Leccion no encontrada');
        const course = await this.courses.findById(lesson.courseId);
        const module = course.modules.find((m) => m.id === lesson.moduleId);
        if (!module)
            throw new common_1.BadRequestException('El modulo de la leccion no existe en el curso');
        if (!course.sourceSetId)
            throw new common_1.BadRequestException('El curso no tiene un cuaderno de fuentes vinculado');
        const started = Date.now();
        try {
            const set = await this.sources.findSet(course.sourceSetId);
            const lessonRefs = lesson.sourceRefs ?? [];
            const moduleRefs = Array.from(new Set(module.lessons.flatMap((l) => l.sourceRefs ?? [])));
            const chosen = lessonRefs.length > 0 ? lessonRefs : moduleRefs;
            const files = [];
            for (const source of set.sources) {
                if (chosen.length === 0 || chosen.includes(source.filename)) {
                    const data = await this.storage.read(source.id);
                    files.push({ filename: source.filename, mimeType: source.mimeType, base64: data.toString('base64') });
                }
            }
            const content = await this.provider.generateLessonContent({
                course: this.courseContext(course),
                moduleTitle: module.title,
                moduleObjective: module.objective ?? '',
                lessonTitle: lesson.title,
                sources: files,
            });
            await this.courses.updateLesson(lessonId, {
                objective: content.objective,
                content: content.content,
                sourceRefs: content.sourceRefs,
            });
            await this.trace(course.id, 'LESSON', lessonId, started, 'SUCCESS', {
                provider: this.provider.name,
                sources: files.length,
            });
            await this.audit.log({
                action: 'GENERATION_LESSON',
                resourceType: 'LESSON',
                resourceId: lessonId,
                detail: { courseId: course.id, provider: this.provider.name },
            });
            return content;
        }
        catch (error) {
            await this.trace(course.id, 'LESSON', lessonId, started, 'ERROR', {
                provider: this.provider.name,
                message: error.message,
            });
            throw error;
        }
    }
    listByCourse(courseId) {
        return this.generations.find({ where: { courseId }, order: { createdAt: 'DESC', id: 'DESC' } });
    }
    courseContext(course) {
        return {
            title: course.title,
            description: course.description,
            objective: course.objective,
            audience: course.audience,
            level: course.level,
            targetHours: course.targetHours,
        };
    }
    proposalToDto(proposal) {
        return {
            modules: proposal.modules.map((m) => ({
                title: m.title,
                objective: m.objective,
                estimatedMinutes: m.estimatedMinutes,
                sourceRefs: m.sourceRefs,
                lessons: m.lessons.map((l) => ({
                    title: l.title,
                    objective: l.objective,
                    estimatedMinutes: l.estimatedMinutes,
                    sourceRefs: m.sourceRefs,
                })),
            })),
            sections: proposal.sections.map((s) => ({ type: s.type, title: s.title, content: s.content })),
        };
    }
    async trace(courseId, phase, lessonId, started, status, summary) {
        await this.generations.save(this.generations.create({
            courseId,
            phase,
            lessonId,
            provider: this.provider.name,
            model: this.provider.model,
            status,
            durationMs: Date.now() - started,
            inputSummary: summary,
            message: status === 'ERROR' ? String(summary.message ?? '') : null,
        }));
    }
};
exports.GenerationService = GenerationService;
exports.GenerationService = GenerationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(course_generation_entity_1.CourseGenerationEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(lesson_entity_1.LessonEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        courses_service_1.CoursesService,
        sources_service_1.SourcesService,
        storage_service_1.StorageService,
        templates_service_1.TemplatesService,
        template_validator_service_1.TemplateValidatorService,
        audit_service_1.AuditService,
        mock_provider_1.MockProvider,
        gemini_provider_1.GeminiProvider,
        config_1.ConfigService])
], GenerationService);
