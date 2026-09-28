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
exports.TemplateEntity = void 0;
const typeorm_1 = require("typeorm");
const course_entity_1 = require("../courses/course.entity");
let TemplateEntity = class TemplateEntity {
};
exports.TemplateEntity = TemplateEntity;
__decorate([
    (0, typeorm_1.Column)({ primary: true, generated: true }),
    __metadata("design:type", Number)
], TemplateEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], TemplateEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], TemplateEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], TemplateEntity.prototype, "sections", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], TemplateEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TemplateEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => course_entity_1.CourseEntity, (course) => course.template),
    __metadata("design:type", Array)
], TemplateEntity.prototype, "courses", void 0);
exports.TemplateEntity = TemplateEntity = __decorate([
    (0, typeorm_1.Entity)('course_templates')
], TemplateEntity);
