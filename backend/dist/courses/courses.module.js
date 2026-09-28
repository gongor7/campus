"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const course_entity_1 = require("./course.entity");
const course_module_entity_1 = require("./course-module.entity");
const lesson_entity_1 = require("./lesson.entity");
const course_section_entity_1 = require("./course-section.entity");
const courses_service_1 = require("./courses.service");
const courses_controller_1 = require("./courses.controller");
const audit_module_1 = require("../audit/audit.module");
const templates_module_1 = require("../templates/templates.module");
let CoursesModule = class CoursesModule {
};
exports.CoursesModule = CoursesModule;
exports.CoursesModule = CoursesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([course_entity_1.CourseEntity, course_module_entity_1.CourseModuleEntity, lesson_entity_1.LessonEntity, course_section_entity_1.CourseSectionEntity]),
            audit_module_1.AuditModule,
            templates_module_1.TemplatesModule,
        ],
        providers: [courses_service_1.CoursesService],
        controllers: [courses_controller_1.CoursesController],
        exports: [courses_service_1.CoursesService],
    })
], CoursesModule);
