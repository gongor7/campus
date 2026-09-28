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
exports.QuestionBanksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const question_bank_entity_1 = require("./question-bank.entity");
const question_entity_1 = require("./question.entity");
const courses_service_1 = require("../courses/courses.service");
const sources_service_1 = require("../sources/sources.service");
const audit_service_1 = require("../audit/audit.service");
const ai_provider_service_1 = require("../generation/ai-provider.service");
const course_generation_entity_1 = require("../generation/course-generation.entity");
let QuestionBanksService = class QuestionBanksService {
    constructor(banks, questions, courses, sources, audit, ai, generations) {
        this.banks = banks;
        this.questions = questions;
        this.courses = courses;
        this.sources = sources;
        this.audit = audit;
        this.ai = ai;
        this.generations = generations;
    }
    async generate(courseId) {
        const course = await this.courses.findById(courseId);
        if (course.status !== 'DRAFT' && course.status !== 'REVIEW') {
            throw new common_1.BadRequestException('El banco solo puede generarse mientras el curso esta en borrador o revision');
        }
        if (!course.sourceSetId)
            throw new common_1.BadRequestException('El curso no tiene un cuaderno de fuentes vinculado');
        const files = await this.sources.readSetFiles(course.sourceSetId);
        if (files.length === 0)
            throw new common_1.BadRequestException('El cuaderno del curso no tiene fuentes cargadas');
        const started = Date.now();
        try {
            const result = await this.ai.provider.generateQuestionBank({
                course: {
                    title: course.title,
                    description: course.description,
                    objective: course.objective,
                    audience: course.audience,
                    level: course.level,
                    targetHours: course.targetHours,
                },
                lessons: course.modules.flatMap((m) => m.lessons.map((l) => ({ title: l.title, content: l.content, sourceRefs: l.sourceRefs }))),
                sources: files,
            });
            await this.questions.delete({ bankId: await this.ensureBank(courseId).then((b) => b.id) });
            const bank = await this.ensureBank(courseId);
            bank.status = 'DRAFT';
            bank.approvedAt = null;
            await this.banks.save(bank);
            await this.questions.delete({ bankId: bank.id });
            for (const [i, draft] of result.questions.entries()) {
                await this.questions.save(this.questions.create({
                    bankId: bank.id,
                    position: i,
                    caseText: draft.caseText,
                    prompt: draft.prompt,
                    expectedConcepts: draft.expectedConcepts,
                    sourceRefs: draft.sourceRefs,
                    variationTemplate: draft.variationTemplate ?? { variableAspects: [], constraints: '' },
                }));
            }
            await this.trace(courseId, 'QUESTIONS', started, 'SUCCESS', { provider: this.ai.name, questions: result.questions.length });
            await this.audit.log({ action: 'BANK_GENERATED', resourceType: 'COURSE', resourceId: courseId, detail: { questions: result.questions.length } });
            return this.findByCourse(courseId);
        }
        catch (error) {
            await this.trace(courseId, 'QUESTIONS', started, 'ERROR', { provider: this.ai.name, message: error.message });
            throw error;
        }
    }
    async findByCourse(courseId) {
        const bank = await this.banks.findOne({ where: { courseId }, relations: { questions: true } });
        if (!bank)
            throw new common_1.NotFoundException('El curso aun no tiene banco de preguntas');
        bank.questions.sort((a, b) => a.position - b.position);
        return bank;
    }
    async addQuestion(courseId, dto) {
        const bank = await this.requireDraftBank(courseId);
        const count = await this.questions.count({ where: { bankId: bank.id } });
        const saved = await this.questions.save(this.questions.create({
            bankId: bank.id,
            position: count,
            ...dto,
            variationTemplate: dto.variationTemplate ?? { variableAspects: [], constraints: '' },
        }));
        await this.audit.log({ action: 'QUESTION_ADDED', resourceType: 'COURSE', resourceId: courseId });
        return saved;
    }
    async updateQuestion(questionId, dto) {
        const question = await this.questions.findOne({ where: { id: questionId }, relations: { bank: true } });
        if (!question)
            throw new common_1.NotFoundException('Pregunta no encontrada');
        if (question.bank.status === 'APPROVED') {
            question.bank.status = 'DRAFT';
            question.bank.approvedAt = null;
            await this.banks.save(question.bank);
        }
        Object.assign(question, dto);
        const saved = await this.questions.save(question);
        await this.audit.log({ action: 'QUESTION_UPDATED', resourceType: 'COURSE', resourceId: question.bank.courseId });
        return saved;
    }
    async deleteQuestion(questionId) {
        const question = await this.questions.findOne({ where: { id: questionId }, relations: { bank: true } });
        if (!question)
            throw new common_1.NotFoundException('Pregunta no encontrada');
        if (question.bank.status === 'APPROVED') {
            question.bank.status = 'DRAFT';
            question.bank.approvedAt = null;
            await this.banks.save(question.bank);
        }
        await this.questions.delete({ id: questionId });
        await this.audit.log({ action: 'QUESTION_DELETED', resourceType: 'COURSE', resourceId: question.bank.courseId });
    }
    async approve(courseId) {
        const bank = await this.findByCourse(courseId);
        if (bank.questions.length === 0) {
            throw new common_1.BadRequestException('El banco no puede aprobarse sin preguntas');
        }
        bank.status = 'APPROVED';
        bank.approvedAt = new Date();
        const saved = await this.banks.save(bank);
        await this.audit.log({ action: 'BANK_APPROVED', resourceType: 'COURSE', resourceId: courseId, detail: { questions: bank.questions.length } });
        return saved;
    }
    async approvedBankWithQuestions(courseId) {
        const bank = await this.banks.findOne({ where: { courseId }, relations: { questions: true } });
        if (!bank || bank.status !== 'APPROVED' || bank.questions.length === 0)
            return [];
        bank.questions.sort((a, b) => a.position - b.position);
        return bank.questions;
    }
    async ensureBank(courseId) {
        const existing = await this.banks.findOne({ where: { courseId } });
        if (existing)
            return existing;
        return this.banks.save(this.banks.create({ courseId }));
    }
    async requireDraftBank(courseId) {
        const bank = await this.banks.findOne({ where: { courseId } });
        if (!bank)
            throw new common_1.NotFoundException('El curso aun no tiene banco de preguntas; generelo primero');
        if (bank.status === 'APPROVED') {
            bank.status = 'DRAFT';
            bank.approvedAt = null;
            await this.banks.save(bank);
        }
        return bank;
    }
    async trace(courseId, phase, started, status, summary) {
        await this.generations.save(this.generations.create({
            courseId,
            phase: phase,
            lessonId: null,
            provider: this.ai.name,
            model: this.ai.model,
            status,
            durationMs: Date.now() - started,
            inputSummary: summary,
            message: status === 'ERROR' ? String(summary.message ?? '') : null,
        }));
    }
};
exports.QuestionBanksService = QuestionBanksService;
exports.QuestionBanksService = QuestionBanksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(question_bank_entity_1.QuestionBankEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(question_entity_1.QuestionEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(course_generation_entity_1.CourseGenerationEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        courses_service_1.CoursesService,
        sources_service_1.SourcesService,
        audit_service_1.AuditService,
        ai_provider_service_1.AiProviderService,
        typeorm_2.Repository])
], QuestionBanksService);
