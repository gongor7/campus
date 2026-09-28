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
exports.AttemptEntity = exports.ATTEMPT_TRANSITIONS = void 0;
const typeorm_1 = require("typeorm");
exports.ATTEMPT_TRANSITIONS = {
    PREPARING: ['IN_PROGRESS', 'GRADING_FAILED'],
    IN_PROGRESS: ['GRADING', 'GRADING_FAILED'],
    GRADING: ['GRADED', 'GRADING_FAILED'],
    GRADED: [],
    GRADING_FAILED: [],
};
let AttemptEntity = class AttemptEntity {
};
exports.AttemptEntity = AttemptEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AttemptEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], AttemptEntity.prototype, "enrollmentId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], AttemptEntity.prototype, "courseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], AttemptEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AttemptEntity.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], AttemptEntity.prototype, "submittedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], AttemptEntity.prototype, "score", void 0);
exports.AttemptEntity = AttemptEntity = __decorate([
    (0, typeorm_1.Entity)('attempts'),
    (0, typeorm_1.Index)('ix_attempt_enrollment', ['enrollmentId'])
], AttemptEntity);
