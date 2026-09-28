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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("./student.entity");
const identity_validator_1 = require("./identity-validator");
const audit_service_1 = require("../audit/audit.service");
let StudentsService = class StudentsService {
    constructor(students, audit) {
        this.students = students;
        this.audit = audit;
    }
    async session(input) {
        const validation = (0, identity_validator_1.validateStudentIdentity)(input);
        if (!validation.valid) {
            throw new common_1.BadRequestException(validation.errors);
        }
        const { name, email } = validation.normalized;
        const existing = await this.students.findOne({ where: { email } });
        if (existing) {
            await this.audit.log({ action: 'STUDENT_SESSION', resourceType: 'STUDENT', resourceId: existing.id, detail: { recovered: true } });
            return existing;
        }
        const student = await this.students.save(this.students.create({ name, email }));
        await this.audit.log({ action: 'STUDENT_REGISTERED', resourceType: 'STUDENT', resourceId: student.id, detail: { email } });
        return student;
    }
    async findById(id) {
        const student = await this.students.findOne({ where: { id } });
        if (!student)
            throw new common_1.NotFoundException('Sesion de estudiante no valida');
        return student;
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.StudentEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_service_1.AuditService])
], StudentsService);
