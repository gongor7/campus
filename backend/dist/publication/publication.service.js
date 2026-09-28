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
exports.PublicationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const course_entity_1 = require("../courses/course.entity");
const audit_service_1 = require("../audit/audit.service");
let PublicationService = class PublicationService {
    constructor(courses, audit) {
        this.courses = courses;
        this.audit = audit;
    }
    async submitReview(courseId) {
        const course = await this.load(courseId);
        if (course.status !== 'DRAFT') {
            throw new common_1.BadRequestException(`No se puede enviar a revision desde el estado ${course.status}`);
        }
        course.status = 'REVIEW';
        const saved = await this.courses.save(course);
        await this.audit.log({ action: 'COURSE_SUBMITTED_REVIEW', resourceType: 'COURSE', resourceId: courseId });
        return this.reload(saved.id);
    }
    async publish(courseId) {
        const course = await this.load(courseId);
        if (course.status !== 'REVIEW') {
            throw new common_1.BadRequestException(`No se puede publicar desde el estado ${course.status}: el curso debe estar en revision (aprobacion docente previa)`);
        }
        const problems = this.completenessProblems(course);
        if (problems.length > 0) {
            throw new common_1.BadRequestException(problems);
        }
        course.status = 'PUBLISHED';
        const saved = await this.courses.save(course);
        await this.audit.log({ action: 'COURSE_PUBLISHED', resourceType: 'COURSE', resourceId: courseId });
        return this.reload(saved.id);
    }
    completenessProblems(course) {
        const problems = [];
        if (course.modules.length === 0)
            problems.push('El curso no tiene estructura (genera la propuesta primero).');
        for (const module of course.modules) {
            for (const lesson of module.lessons) {
                if (!lesson.content || lesson.content.trim().length === 0) {
                    problems.push(`La leccion "${lesson.title}" no tiene contenido.`);
                }
            }
        }
        const required = ['INTRODUCTION', 'PRACTICE', 'EVALUATION', 'CLOSING'];
        const present = new Set(course.sections.map((s) => s.type));
        for (const type of required) {
            if (!present.has(type))
                problems.push(`Falta la seccion ${type}.`);
        }
        return problems;
    }
    async load(courseId) {
        const course = await this.courses.findOne({
            where: { id: courseId },
            relations: { modules: { lessons: true }, sections: true },
        });
        if (!course)
            throw new common_1.BadRequestException('Curso no encontrado');
        course.modules.sort((a, b) => a.position - b.position);
        for (const module of course.modules)
            module.lessons.sort((a, b) => a.position - b.position);
        return course;
    }
    reload(courseId) {
        return this.courses.findOneOrFail({ where: { id: courseId } });
    }
};
exports.PublicationService = PublicationService;
exports.PublicationService = PublicationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(course_entity_1.CourseEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_service_1.AuditService])
], PublicationService);
