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
exports.LessonProgressEntity = void 0;
const typeorm_1 = require("typeorm");
const enrollment_entity_1 = require("./enrollment.entity");
const lesson_entity_1 = require("../courses/lesson.entity");
let LessonProgressEntity = class LessonProgressEntity {
};
exports.LessonProgressEntity = LessonProgressEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LessonProgressEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LessonProgressEntity.prototype, "enrollmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => enrollment_entity_1.EnrollmentEntity),
    (0, typeorm_1.JoinColumn)({ name: 'enrollmentId' }),
    __metadata("design:type", enrollment_entity_1.EnrollmentEntity)
], LessonProgressEntity.prototype, "enrollment", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LessonProgressEntity.prototype, "lessonId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lesson_entity_1.LessonEntity),
    (0, typeorm_1.JoinColumn)({ name: 'lessonId' }),
    __metadata("design:type", lesson_entity_1.LessonEntity)
], LessonProgressEntity.prototype, "lesson", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], LessonProgressEntity.prototype, "completedAt", void 0);
exports.LessonProgressEntity = LessonProgressEntity = __decorate([
    (0, typeorm_1.Entity)('lesson_progress'),
    (0, typeorm_1.Index)('uq_progress_enrollment_lesson', ['enrollmentId', 'lessonId'])
], LessonProgressEntity);
