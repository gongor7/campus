"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const enrollment_entity_1 = require("./enrollment.entity");
const lesson_progress_entity_1 = require("./lesson-progress.entity");
const lesson_entity_1 = require("../courses/lesson.entity");
const enrollments_service_1 = require("./enrollments.service");
const enrollments_controller_1 = require("./enrollments.controller");
const students_module_1 = require("../students/students.module");
const courses_module_1 = require("../courses/courses.module");
const audit_module_1 = require("../audit/audit.module");
let EnrollmentsModule = class EnrollmentsModule {
};
exports.EnrollmentsModule = EnrollmentsModule;
exports.EnrollmentsModule = EnrollmentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([enrollment_entity_1.EnrollmentEntity, lesson_progress_entity_1.LessonProgressEntity, lesson_entity_1.LessonEntity]),
            students_module_1.StudentsModule,
            courses_module_1.CoursesModule,
            audit_module_1.AuditModule,
        ],
        providers: [enrollments_service_1.EnrollmentsService],
        controllers: [enrollments_controller_1.EnrollmentsController],
        exports: [enrollments_service_1.EnrollmentsService],
    })
], EnrollmentsModule);
