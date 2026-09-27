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
exports.AttemptStepEntity = void 0;
const typeorm_1 = require("typeorm");
const attempt_entity_1 = require("./attempt.entity");
const scenario_entity_1 = require("../scenarios/scenario.entity");
const decision_entity_1 = require("../decisions/decision.entity");
let AttemptStepEntity = class AttemptStepEntity {
};
exports.AttemptStepEntity = AttemptStepEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AttemptStepEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AttemptStepEntity.prototype, "attemptId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => attempt_entity_1.AttemptEntity, (attempt) => attempt.steps),
    (0, typeorm_1.JoinColumn)({ name: 'attemptId' }),
    __metadata("design:type", attempt_entity_1.AttemptEntity)
], AttemptStepEntity.prototype, "attempt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], AttemptStepEntity.prototype, "scenarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => scenario_entity_1.ScenarioEntity),
    (0, typeorm_1.JoinColumn)({ name: 'scenarioId' }),
    __metadata("design:type", scenario_entity_1.ScenarioEntity)
], AttemptStepEntity.prototype, "scenario", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], AttemptStepEntity.prototype, "decisionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => decision_entity_1.DecisionEntity, (decision) => decision.steps),
    (0, typeorm_1.JoinColumn)({ name: 'decisionId' }),
    __metadata("design:type", decision_entity_1.DecisionEntity)
], AttemptStepEntity.prototype, "decision", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], AttemptStepEntity.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AttemptStepEntity.prototype, "createdAt", void 0);
exports.AttemptStepEntity = AttemptStepEntity = __decorate([
    (0, typeorm_1.Entity)('attempt_steps'),
    (0, typeorm_1.Index)('uq_attempt_scenario', ['attemptId', 'scenarioId'])
], AttemptStepEntity);
