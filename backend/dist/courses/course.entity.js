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
exports.CourseEntity = void 0;
const typeorm_1 = require("typeorm");
const template_entity_1 = require("../templates/template.entity");
const source_set_entity_1 = require("../sources/source-set.entity");
const course_module_entity_1 = require("./course-module.entity");
const course_section_entity_1 = require("./course-section.entity");
let CourseEntity = class CourseEntity {
};
exports.CourseEntity = CourseEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CourseEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], CourseEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: '' }),
    __metadata("design:type", String)
], CourseEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: '' }),
    __metadata("design:type", String)
], CourseEntity.prototype, "objective", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, default: '' }),
    __metadata("design:type", String)
], CourseEntity.prototype, "audience", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], CourseEntity.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CourseEntity.prototype, "targetHours", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CourseEntity.prototype, "templateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => template_entity_1.TemplateEntity, (template) => template.courses),
    (0, typeorm_1.JoinColumn)({ name: 'templateId' }),
    __metadata("design:type", template_entity_1.TemplateEntity)
], CourseEntity.prototype, "template", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Object)
], CourseEntity.prototype, "sourceSetId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => source_set_entity_1.SourceSetEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'sourceSetId' }),
    __metadata("design:type", Object)
], CourseEntity.prototype, "sourceSet", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'DRAFT' }),
    __metadata("design:type", String)
], CourseEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'docente' }),
    __metadata("design:type", String)
], CourseEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CourseEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CourseEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => course_module_entity_1.CourseModuleEntity, (m) => m.course),
    __metadata("design:type", Array)
], CourseEntity.prototype, "modules", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => course_section_entity_1.CourseSectionEntity, (s) => s.course),
    __metadata("design:type", Array)
], CourseEntity.prototype, "sections", void 0);
exports.CourseEntity = CourseEntity = __decorate([
    (0, typeorm_1.Entity)('courses')
], CourseEntity);
