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
exports.AttemptsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attempt_entity_1 = require("./attempt.entity");
const attempt_step_entity_1 = require("./attempt-step.entity");
const scenario_entity_1 = require("../scenarios/scenario.entity");
const decision_entity_1 = require("../decisions/decision.entity");
const evaluation_service_1 = require("../evaluation/evaluation.service");
let AttemptsService = class AttemptsService {
    constructor(attempts, steps, scenarios, decisions, evaluation) {
        this.attempts = attempts;
        this.steps = steps;
        this.scenarios = scenarios;
        this.decisions = decisions;
        this.evaluation = evaluation;
    }
    async create(simulationId, sessionId) {
        const firstScenario = await this.scenarios.findOne({
            where: { simulationId },
            order: { id: 'ASC' },
        });
        if (!firstScenario)
            throw new common_1.NotFoundException('La simulación no tiene escenarios');
        const attempt = await this.attempts.save(this.attempts.create({ sessionId, simulationId, currentScenarioId: firstScenario.id }));
        return { attempt, scenario: await this.toPublicScenario(firstScenario.id) };
    }
    async findById(id) {
        const attempt = await this.attempts.findOne({ where: { id } });
        if (!attempt)
            throw new common_1.NotFoundException('Intento no encontrado');
        return attempt;
    }
    async getState(id) {
        const attempt = await this.findById(id);
        const scenario = attempt.status === 'completed' || !attempt.currentScenarioId
            ? null
            : await this.toPublicScenario(attempt.currentScenarioId);
        return { attempt, scenario };
    }
    async decide(attemptId, decisionId) {
        const attempt = await this.findById(attemptId);
        if (attempt.status === 'completed') {
            throw new common_1.BadRequestException('El intento ya está completado');
        }
        if (!attempt.currentScenarioId) {
            throw new common_1.BadRequestException('El intento no tiene un escenario activo');
        }
        const scenarioId = attempt.currentScenarioId;
        const decision = await this.decisions.findOne({ where: { id: decisionId } });
        if (!decision)
            throw new common_1.NotFoundException('Decisión no encontrada');
        if (decision.scenarioId !== scenarioId) {
            throw new common_1.BadRequestException('La decisión no pertenece al escenario actual');
        }
        const existing = await this.steps.findOne({ where: { attemptId, scenarioId } });
        if (existing) {
            throw new common_1.BadRequestException('El escenario actual ya fue decidido en este intento');
        }
        const scenarioDecisions = await this.decisions.find({ where: { scenarioId } });
        const outcome = this.evaluation.evaluate(decision, scenarioDecisions);
        const position = await this.steps.count({ where: { attemptId } });
        await this.steps.save(this.steps.create({ attemptId, scenarioId, decisionId, position }));
        attempt.score += outcome.awardedScore;
        attempt.maxScore += outcome.scenarioMaxScore;
        let nextScenario = null;
        if (outcome.isTerminal) {
            attempt.status = 'completed';
            attempt.currentScenarioId = null;
            attempt.completedAt = new Date();
        }
        else {
            attempt.currentScenarioId = outcome.nextScenarioId;
            nextScenario = await this.toPublicScenario(outcome.nextScenarioId);
        }
        await this.attempts.save(attempt);
        return {
            consequence: decision.consequence,
            feedback: decision.feedback,
            stepMaxScore: outcome.scenarioMaxScore,
            completed: outcome.isTerminal,
            nextScenario,
        };
    }
    async getResult(attemptId) {
        const attempt = await this.findById(attemptId);
        if (attempt.status !== 'completed') {
            throw new common_1.BadRequestException('El intento aún no está completado');
        }
        const steps = await this.steps.find({
            where: { attemptId },
            relations: { scenario: true, decision: true },
            order: { position: 'ASC' },
        });
        return {
            attemptId: attempt.id,
            simulationId: attempt.simulationId,
            score: attempt.score,
            maxScore: attempt.maxScore,
            steps: steps.map((s) => ({
                position: s.position,
                scenarioTitle: s.scenario.title,
                question: s.scenario.question,
                decisionLabel: s.decision.label,
                feedback: s.decision.feedback,
                score: s.decision.score,
            })),
        };
    }
    async toPublicScenario(scenarioId) {
        const scenario = await this.scenarios.findOne({
            where: { id: scenarioId },
            relations: { decisions: true },
        });
        if (!scenario)
            throw new common_1.NotFoundException('Escenario no encontrado');
        return {
            id: scenario.id,
            code: scenario.code,
            title: scenario.title,
            context: scenario.context,
            information: scenario.information,
            question: scenario.question,
            decisions: scenario.decisions
                .sort((a, b) => a.code.localeCompare(b.code))
                .map((d) => ({ id: d.id, code: d.code, label: d.label })),
        };
    }
};
exports.AttemptsService = AttemptsService;
exports.AttemptsService = AttemptsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attempt_entity_1.AttemptEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(attempt_step_entity_1.AttemptStepEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(scenario_entity_1.ScenarioEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(decision_entity_1.DecisionEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        evaluation_service_1.EvaluationService])
], AttemptsService);
