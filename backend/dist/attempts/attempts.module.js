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
const attempt_step_entity_1 = require("./attempt-step.entity");
const scenario_entity_1 = require("../scenarios/scenario.entity");
const decision_entity_1 = require("../decisions/decision.entity");
const attempts_controller_1 = require("./attempts.controller");
const attempts_service_1 = require("./attempts.service");
const evaluation_service_1 = require("../evaluation/evaluation.service");
let AttemptsModule = class AttemptsModule {
};
exports.AttemptsModule = AttemptsModule;
exports.AttemptsModule = AttemptsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([attempt_entity_1.AttemptEntity, attempt_step_entity_1.AttemptStepEntity, scenario_entity_1.ScenarioEntity, decision_entity_1.DecisionEntity]),
        ],
        controllers: [attempts_controller_1.AttemptsController],
        providers: [attempts_service_1.AttemptsService, evaluation_service_1.EvaluationService],
        exports: [attempts_service_1.AttemptsService],
    })
], AttemptsModule);
