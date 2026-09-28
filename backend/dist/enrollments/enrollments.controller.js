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
exports.EnrollmentsController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const enrollments_service_1 = require("./enrollments.service");
const students_service_1 = require("../students/students.service");
class SetProgressDto {
}
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SetProgressDto.prototype, "completed", void 0);
let EnrollmentsController = class EnrollmentsController {
    constructor(enrollments, students) {
        this.enrollments = enrollments;
        this.students = students;
    }
    async catalog() {
        return this.enrollments.catalog();
    }
    async enroll(studentId, courseId) {
        await this.students.findById(studentId);
        return this.enrollments.enroll(studentId, courseId);
    }
    async myCourses(studentId) {
        await this.students.findById(studentId);
        return this.enrollments.myCourses(studentId);
    }
    async courseForStudent(studentId, courseId) {
        await this.students.findById(studentId);
        return this.enrollments.courseForStudent(studentId, courseId);
    }
    async setProgress(studentId, lessonId, dto) {
        await this.students.findById(studentId);
        return this.enrollments.setProgress(studentId, lessonId, dto.completed);
    }
};
exports.EnrollmentsController = EnrollmentsController;
__decorate([
    (0, common_1.Get)('courses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "catalog", null);
__decorate([
    (0, common_1.Post)('courses/:courseId/enroll'),
    __param(0, (0, common_1.Headers)('x-student-id')),
    __param(1, (0, common_1.Param)('courseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "enroll", null);
__decorate([
    (0, common_1.Get)('me/courses'),
    __param(0, (0, common_1.Headers)('x-student-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "myCourses", null);
__decorate([
    (0, common_1.Get)('me/courses/:courseId'),
    __param(0, (0, common_1.Headers)('x-student-id')),
    __param(1, (0, common_1.Param)('courseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "courseForStudent", null);
__decorate([
    (0, common_1.Put)('me/lessons/:lessonId/progress'),
    __param(0, (0, common_1.Headers)('x-student-id')),
    __param(1, (0, common_1.Param)('lessonId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, SetProgressDto]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "setProgress", null);
exports.EnrollmentsController = EnrollmentsController = __decorate([
    (0, common_1.Controller)('students'),
    __metadata("design:paramtypes", [enrollments_service_1.EnrollmentsService,
        students_service_1.StudentsService])
], EnrollmentsController);
