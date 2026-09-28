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
exports.QuestionEntity = void 0;
const typeorm_1 = require("typeorm");
const question_bank_entity_1 = require("./question-bank.entity");
let QuestionEntity = class QuestionEntity {
};
exports.QuestionEntity = QuestionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], QuestionEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], QuestionEntity.prototype, "bankId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => question_bank_entity_1.QuestionBankEntity, (bank) => bank.questions),
    (0, typeorm_1.JoinColumn)({ name: 'bankId' }),
    __metadata("design:type", question_bank_entity_1.QuestionBankEntity)
], QuestionEntity.prototype, "bank", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], QuestionEntity.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], QuestionEntity.prototype, "caseText", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], QuestionEntity.prototype, "prompt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], QuestionEntity.prototype, "expectedConcepts", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], QuestionEntity.prototype, "sourceRefs", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], QuestionEntity.prototype, "variationTemplate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], QuestionEntity.prototype, "createdAt", void 0);
exports.QuestionEntity = QuestionEntity = __decorate([
    (0, typeorm_1.Entity)('questions')
], QuestionEntity);
