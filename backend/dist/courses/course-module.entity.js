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
exports.CourseModuleEntity = void 0;
const typeorm_1 = require("typeorm");
const course_entity_1 = require("./course.entity");
const lesson_entity_1 = require("./lesson.entity");
let CourseModuleEntity = class CourseModuleEntity {
};
exports.CourseModuleEntity = CourseModuleEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CourseModuleEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CourseModuleEntity.prototype, "courseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => course_entity_1.CourseEntity, (course) => course.modules),
    (0, typeorm_1.JoinColumn)({ name: 'courseId' }),
    __metadata("design:type", course_entity_1.CourseEntity)
], CourseModuleEntity.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], CourseModuleEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], CourseModuleEntity.prototype, "objective", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CourseModuleEntity.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CourseModuleEntity.prototype, "estimatedMinutes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lesson_entity_1.LessonEntity, (lesson) => lesson.module),
    __metadata("design:type", Array)
], CourseModuleEntity.prototype, "lessons", void 0);
exports.CourseModuleEntity = CourseModuleEntity = __decorate([
    (0, typeorm_1.Entity)('course_modules')
], CourseModuleEntity);
