"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionBanksModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const question_bank_entity_1 = require("./question-bank.entity");
const question_entity_1 = require("./question.entity");
const course_generation_entity_1 = require("../generation/course-generation.entity");
const question_banks_service_1 = require("./question-banks.service");
const question_banks_controller_1 = require("./question-banks.controller");
const courses_module_1 = require("../courses/courses.module");
const sources_module_1 = require("../sources/sources.module");
const audit_module_1 = require("../audit/audit.module");
const generation_module_1 = require("../generation/generation.module");
let QuestionBanksModule = class QuestionBanksModule {
};
exports.QuestionBanksModule = QuestionBanksModule;
exports.QuestionBanksModule = QuestionBanksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([question_bank_entity_1.QuestionBankEntity, question_entity_1.QuestionEntity, course_generation_entity_1.CourseGenerationEntity]),
            courses_module_1.CoursesModule,
            sources_module_1.SourcesModule,
            audit_module_1.AuditModule,
            generation_module_1.GenerationModule,
        ],
        providers: [question_banks_service_1.QuestionBanksService],
        controllers: [question_banks_controller_1.QuestionBanksController],
        exports: [question_banks_service_1.QuestionBanksService],
    })
], QuestionBanksModule);
