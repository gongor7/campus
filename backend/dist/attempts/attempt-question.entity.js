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
exports.AttemptQuestionEntity = void 0;
const typeorm_1 = require("typeorm");
const attempt_entity_1 = require("./attempt.entity");
const question_entity_1 = require("../question-banks/question.entity");
let AttemptQuestionEntity = class AttemptQuestionEntity {
};
exports.AttemptQuestionEntity = AttemptQuestionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AttemptQuestionEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AttemptQuestionEntity.prototype, "attemptId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => attempt_entity_1.AttemptEntity),
    (0, typeorm_1.JoinColumn)({ name: 'attemptId' }),
    __metadata("design:type", attempt_entity_1.AttemptEntity)
], AttemptQuestionEntity.prototype, "attempt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], AttemptQuestionEntity.prototype, "questionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => question_entity_1.QuestionEntity),
    (0, typeorm_1.JoinColumn)({ name: 'questionId' }),
    __metadata("design:type", question_entity_1.QuestionEntity)
], AttemptQuestionEntity.prototype, "question", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], AttemptQuestionEntity.prototype, "variantCase", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], AttemptQuestionEntity.prototype, "answer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], AttemptQuestionEntity.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], AttemptQuestionEntity.prototype, "feedback", void 0);
exports.AttemptQuestionEntity = AttemptQuestionEntity = __decorate([
    (0, typeorm_1.Entity)('attempt_questions'),
    (0, typeorm_1.Index)('ix_attempt_question_attempt', ['attemptId'])
], AttemptQuestionEntity);
