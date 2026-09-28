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
exports.AttemptsController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const attempts_service_1 = require("./attempts.service");
const students_service_1 = require("../students/students.service");
class SubmitAnswerDto {
}
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SubmitAnswerDto.prototype, "questionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitAnswerDto.prototype, "answer", void 0);
class SubmitAttemptDto {
}
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SubmitAnswerDto),
    __metadata("design:type", Array)
], SubmitAttemptDto.prototype, "answers", void 0);
let AttemptsController = class AttemptsController {
    constructor(attempts, students) {
        this.attempts = attempts;
        this.students = students;
    }
    async start(studentId, courseId) {
        await this.students.findById(studentId);
        return this.attempts.start(studentId, courseId);
    }
    async submit(studentId, attemptId, dto) {
        await this.students.findById(studentId);
        return this.attempts.submit(studentId, attemptId, dto.answers);
    }
    async getAttempt(studentId, attemptId) {
        await this.students.findById(studentId);
        return this.attempts.getAttempt(attemptId, studentId);
    }
    async history(studentId, courseId) {
        await this.students.findById(studentId);
        return this.attempts.history(studentId, courseId);
    }
};
exports.AttemptsController = AttemptsController;
__decorate([
    (0, common_1.Post)('me/courses/:courseId/attempts'),
    __param(0, (0, common_1.Headers)('x-student-id')),
    __param(1, (0, common_1.Param)('courseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AttemptsController.prototype, "start", null);
__decorate([
    (0, common_1.Post)('me/attempts/:attemptId/submit'),
    __param(0, (0, common_1.Headers)('x-student-id')),
    __param(1, (0, common_1.Param)('attemptId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, SubmitAttemptDto]),
    __metadata("design:returntype", Promise)
], AttemptsController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)('me/attempts/:attemptId'),
    __param(0, (0, common_1.Headers)('x-student-id')),
    __param(1, (0, common_1.Param)('attemptId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttemptsController.prototype, "getAttempt", null);
__decorate([
    (0, common_1.Get)('me/courses/:courseId/attempts'),
    __param(0, (0, common_1.Headers)('x-student-id')),
    __param(1, (0, common_1.Param)('courseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AttemptsController.prototype, "history", null);
exports.AttemptsController = AttemptsController = __decorate([
    (0, common_1.Controller)('students'),
    __metadata("design:paramtypes", [attempts_service_1.AttemptsService,
        students_service_1.StudentsService])
], AttemptsController);
