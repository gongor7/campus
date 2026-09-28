"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const course_generation_entity_1 = require("./course-generation.entity");
const lesson_entity_1 = require("../courses/lesson.entity");
const generation_service_1 = require("./generation.service");
const generation_controller_1 = require("./generation.controller");
const mock_provider_1 = require("./mock.provider");
const gemini_provider_1 = require("./gemini.provider");
const courses_module_1 = require("../courses/courses.module");
const sources_module_1 = require("../sources/sources.module");
const templates_module_1 = require("../templates/templates.module");
const audit_module_1 = require("../audit/audit.module");
let GenerationModule = class GenerationModule {
};
exports.GenerationModule = GenerationModule;
exports.GenerationModule = GenerationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([course_generation_entity_1.CourseGenerationEntity, lesson_entity_1.LessonEntity]),
            courses_module_1.CoursesModule,
            sources_module_1.SourcesModule,
            templates_module_1.TemplatesModule,
            audit_module_1.AuditModule,
        ],
        providers: [generation_service_1.GenerationService, mock_provider_1.MockProvider, gemini_provider_1.GeminiProvider],
        controllers: [generation_controller_1.GenerationController],
    })
], GenerationModule);
