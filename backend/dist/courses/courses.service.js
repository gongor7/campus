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
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const course_entity_1 = require("./course.entity");
const course_module_entity_1 = require("./course-module.entity");
const lesson_entity_1 = require("./lesson.entity");
const course_section_entity_1 = require("./course-section.entity");
const audit_service_1 = require("../audit/audit.service");
const templates_service_1 = require("../templates/templates.service");
const template_validator_service_1 = require("../templates/template-validator.service");
const EDITABLE_STATUSES = ['DRAFT', 'REVIEW'];
let CoursesService = class CoursesService {
    constructor(courses, modules, lessons, sectionsRepo, audit, templates, validator) {
        this.courses = courses;
        this.modules = modules;
        this.lessons = lessons;
        this.sectionsRepo = sectionsRepo;
        this.audit = audit;
        this.templates = templates;
        this.validator = validator;
    }
    async create(dto) {
        const templateId = dto.templateId ?? (await this.defaultTemplate()).id;
        const course = await this.courses.save(this.courses.create({ ...dto, templateId, sourceSetId: dto.sourceSetId ?? null }));
        await this.audit.log({ action: 'COURSE_CREATED', resourceType: 'COURSE', resourceId: course.id, detail: { title: course.title } });
        return course;
    }
    findAll() {
        return this.courses.find({ order: { updatedAt: 'DESC' } });
    }
    async findById(id) {
        const course = await this.courses.findOne({
            where: { id },
            relations: {
                modules: { lessons: true },
                sections: true,
                template: true,
                sourceSet: { sources: true },
            },
        });
        if (!course)
            throw new common_1.NotFoundException('Curso no encontrado');
        this.sortTree(course);
        return course;
    }
    async update(id, dto) {
        const course = await this.findEditable(id);
        Object.assign(course, dto);
        const saved = await this.courses.save(course);
        await this.audit.log({ action: 'COURSE_UPDATED', resourceType: 'COURSE', resourceId: id });
        return saved;
    }
    async replaceOutline(id, dto) {
        const course = await this.findEditable(id);
        const template = course.template ?? (await this.templates.findById(course.templateId));
        const errors = this.validator.validate({
            modules: dto.modules.map((m) => ({ title: m.title, lessons: m.lessons.map((l) => ({ title: l.title })) })),
            sections: dto.sections.map((s) => ({ type: s.type })),
        }, template);
        if (errors.length > 0)
            throw new common_1.BadRequestException(errors);
        await this.modules.delete({ courseId: id });
        await this.sectionsRepo.delete({ courseId: id });
        for (const [moduleIndex, moduleDto] of dto.modules.entries()) {
            await this.insertModule(course, moduleDto, moduleIndex);
        }
        for (const [sectionIndex, sectionDto] of dto.sections.entries()) {
            await this.sectionsRepo.save(this.sectionsRepo.create({
                courseId: id,
                type: sectionDto.type,
                title: sectionDto.title,
                content: sectionDto.content ?? null,
                position: sectionIndex,
            }));
        }
        await this.audit.log({ action: 'OUTLINE_REPLACED', resourceType: 'COURSE', resourceId: id, detail: { modules: dto.modules.length } });
        return this.findById(id);
    }
    async updateLesson(lessonId, dto) {
        const lesson = await this.lessons.findOne({ where: { id: lessonId }, relations: { course: true } });
        if (!lesson)
            throw new common_1.NotFoundException('Leccion no encontrada');
        if (!EDITABLE_STATUSES.includes(lesson.course.status)) {
            throw new common_1.BadRequestException('El curso no es editable en su estado actual');
        }
        Object.assign(lesson, dto);
        const saved = await this.lessons.save(lesson);
        await this.audit.log({ action: 'LESSON_UPDATED', resourceType: 'LESSON', resourceId: lessonId, detail: { courseId: lesson.courseId } });
        return saved;
    }
    async updateSection(sectionId, dto) {
        const section = await this.sectionsRepo.findOne({ where: { id: sectionId }, relations: { course: true } });
        if (!section)
            throw new common_1.NotFoundException('Seccion no encontrada');
        if (!EDITABLE_STATUSES.includes(section.course.status)) {
            throw new common_1.BadRequestException('El curso no es editable en su estado actual');
        }
        Object.assign(section, dto);
        const saved = await this.sectionsRepo.save(section);
        await this.audit.log({ action: 'SECTION_UPDATED', resourceType: 'SECTION', resourceId: sectionId, detail: { courseId: section.courseId } });
        return saved;
    }
    async archive(id) {
        const course = await this.findEditable(id);
        course.status = 'ARCHIVED';
        const saved = await this.courses.save(course);
        await this.audit.log({ action: 'COURSE_ARCHIVED', resourceType: 'COURSE', resourceId: id });
        return saved;
    }
    async insertModule(course, dto, position) {
        const module = await this.modules.save(this.modules.create({
            courseId: course.id,
            title: dto.title,
            objective: dto.objective ?? null,
            position,
            estimatedMinutes: dto.estimatedMinutes,
        }));
        for (const [lessonIndex, lessonDto] of dto.lessons.entries()) {
            await this.lessons.save(this.lessons.create({
                courseId: course.id,
                moduleId: module.id,
                title: lessonDto.title,
                objective: lessonDto.objective ?? null,
                estimatedMinutes: lessonDto.estimatedMinutes,
                sourceRefs: lessonDto.sourceRefs ?? null,
                position: lessonIndex,
            }));
        }
    }
    async findEditable(id) {
        const course = await this.courses.findOne({ where: { id }, relations: { template: true } });
        if (!course)
            throw new common_1.NotFoundException('Curso no encontrado');
        if (!EDITABLE_STATUSES.includes(course.status)) {
            throw new common_1.BadRequestException('El curso no es editable en su estado actual');
        }
        return course;
    }
    async defaultTemplate() {
        const all = await this.templates.findActive();
        const standard = all.find((t) => t.code === 'ASFI_STANDARD');
        return standard ?? all[0];
    }
    sortTree(course) {
        course.modules.sort((a, b) => a.position - b.position);
        for (const module of course.modules) {
            module.lessons.sort((a, b) => a.position - b.position);
        }
        course.sections.sort((a, b) => a.position - b.position);
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(course_entity_1.CourseEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(course_module_entity_1.CourseModuleEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(lesson_entity_1.LessonEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(course_section_entity_1.CourseSectionEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService,
        templates_service_1.TemplatesService,
        template_validator_service_1.TemplateValidatorService])
], CoursesService);
