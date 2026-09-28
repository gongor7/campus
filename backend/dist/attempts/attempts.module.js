"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttemptsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const attempt_entity_1 = require("./attempt.entity");
const attempt_question_entity_1 = require("./attempt-question.entity");
const enrollment_entity_1 = require("../enrollments/enrollment.entity");
const attempts_service_1 = require("./attempts.service");
const attempts_controller_1 = require("./attempts.controller");
const students_module_1 = require("../students/students.module");
const enrollments_module_1 = require("../enrollments/enrollments.module");
const question_banks_module_1 = require("../question-banks/question-banks.module");
const courses_module_1 = require("../courses/courses.module");
const generation_module_1 = require("../generation/generation.module");
const audit_module_1 = require("../audit/audit.module");
let AttemptsModule = class AttemptsModule {
};
exports.AttemptsModule = AttemptsModule;
exports.AttemptsModule = AttemptsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([attempt_entity_1.AttemptEntity, attempt_question_entity_1.AttemptQuestionEntity, enrollment_entity_1.EnrollmentEntity]),
            students_module_1.StudentsModule,
            enrollments_module_1.EnrollmentsModule,
            question_banks_module_1.QuestionBanksModule,
            courses_module_1.CoursesModule,
            generation_module_1.GenerationModule,
            audit_module_1.AuditModule,
        ],
        providers: [attempts_service_1.AttemptsService],
        controllers: [attempts_controller_1.AttemptsController],
    })
], AttemptsModule);
