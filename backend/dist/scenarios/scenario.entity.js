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
exports.ScenarioEntity = void 0;
const typeorm_1 = require("typeorm");
const simulation_entity_1 = require("../simulations/simulation.entity");
const decision_entity_1 = require("../decisions/decision.entity");
let ScenarioEntity = class ScenarioEntity {
};
exports.ScenarioEntity = ScenarioEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ScenarioEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ScenarioEntity.prototype, "simulationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => simulation_entity_1.SimulationEntity, (simulation) => simulation.scenarios),
    (0, typeorm_1.JoinColumn)({ name: 'simulationId' }),
    __metadata("design:type", simulation_entity_1.SimulationEntity)
], ScenarioEntity.prototype, "simulation", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ScenarioEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ScenarioEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ScenarioEntity.prototype, "context", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], ScenarioEntity.prototype, "information", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ScenarioEntity.prototype, "question", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => decision_entity_1.DecisionEntity, (decision) => decision.scenario),
    __metadata("design:type", Array)
], ScenarioEntity.prototype, "decisions", void 0);
exports.ScenarioEntity = ScenarioEntity = __decorate([
    (0, typeorm_1.Entity)('scenarios'),
    (0, typeorm_1.Index)('uq_scenario_code', ['simulationId', 'code'])
], ScenarioEntity);
