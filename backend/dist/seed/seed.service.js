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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const simulation_entity_1 = require("../simulations/simulation.entity");
const scenario_entity_1 = require("../scenarios/scenario.entity");
const decision_entity_1 = require("../decisions/decision.entity");
const content_1 = require("./content");
let SeedService = SeedService_1 = class SeedService {
    constructor(simulations, scenarios, decisions) {
        this.simulations = simulations;
        this.scenarios = scenarios;
        this.decisions = decisions;
        this.logger = new common_1.Logger(SeedService_1.name);
    }
    async onModuleInit() {
        await this.seedPilot();
    }
    async seedPilot() {
        const existing = await this.simulations.findOne({ where: { slug: content_1.PILOT_SIMULATION.slug } });
        if (existing) {
            this.logger.log('Seed omitido: la simulación piloto ya existe');
            return;
        }
        const simulation = await this.simulations.save(this.simulations.create({
            slug: content_1.PILOT_SIMULATION.slug,
            title: content_1.PILOT_SIMULATION.title,
            objective: content_1.PILOT_SIMULATION.objective,
            description: content_1.PILOT_SIMULATION.description,
        }));
        const scenarioIds = new Map();
        for (const s of content_1.PILOT_SIMULATION.scenarios) {
            const scenario = await this.scenarios.save(this.scenarios.create({
                simulationId: simulation.id,
                code: s.code,
                title: s.title,
                context: s.context,
                information: s.information,
                question: s.question,
            }));
            scenarioIds.set(s.code, scenario.id);
        }
        for (const s of content_1.PILOT_SIMULATION.scenarios) {
            const scenarioId = scenarioIds.get(s.code);
            for (const d of s.decisions) {
                await this.decisions.save(this.decisions.create({
                    scenarioId,
                    code: d.code,
                    label: d.label,
                    consequence: d.consequence,
                    feedback: d.feedback,
                    score: d.score,
                    nextScenarioId: d.nextScenarioCode ? scenarioIds.get(d.nextScenarioCode) : null,
                }));
            }
        }
        this.logger.log(`Seed completo: "${content_1.PILOT_SIMULATION.title}" (${content_1.PILOT_SIMULATION.scenarios.length} escenarios)`);
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(simulation_entity_1.SimulationEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(scenario_entity_1.ScenarioEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(decision_entity_1.DecisionEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
