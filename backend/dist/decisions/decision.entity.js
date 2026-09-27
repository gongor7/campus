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
exports.DecisionEntity = void 0;
const typeorm_1 = require("typeorm");
const scenario_entity_1 = require("../scenarios/scenario.entity");
const attempt_step_entity_1 = require("../attempts/attempt-step.entity");
let DecisionEntity = class DecisionEntity {
};
exports.DecisionEntity = DecisionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DecisionEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DecisionEntity.prototype, "scenarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => scenario_entity_1.ScenarioEntity, (scenario) => scenario.decisions),
    (0, typeorm_1.JoinColumn)({ name: 'scenarioId' }),
    __metadata("design:type", scenario_entity_1.ScenarioEntity)
], DecisionEntity.prototype, "scenario", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DecisionEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DecisionEntity.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DecisionEntity.prototype, "consequence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DecisionEntity.prototype, "feedback", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], DecisionEntity.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], DecisionEntity.prototype, "nextScenarioId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => attempt_step_entity_1.AttemptStepEntity, (step) => step.decision),
    __metadata("design:type", Array)
], DecisionEntity.prototype, "steps", void 0);
exports.DecisionEntity = DecisionEntity = __decorate([
    (0, typeorm_1.Entity)('decisions'),
    (0, typeorm_1.Index)('uq_decision_code', ['scenarioId', 'code'])
], DecisionEntity);
