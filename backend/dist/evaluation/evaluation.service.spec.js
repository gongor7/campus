"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const evaluation_service_1 = require("./evaluation.service");
const decision = (over) => ({ id: 1, scenarioId: 1, code: 'A', label: '', consequence: '', feedback: '', score: 0, nextScenarioId: null, ...over });
describe('EvaluationService', () => {
    let service;
    beforeEach(() => {
        service = new evaluation_service_1.EvaluationService();
    });
    it('otorga el puntaje de la decisión elegida y el máximo del escenario', () => {
        const d = decision({ score: 60, nextScenarioId: 2 });
        const outcome = service.evaluate(d, [d, decision({ id: 2, score: 95, nextScenarioId: 3 })]);
        expect(outcome.awardedScore).toBe(60);
        expect(outcome.scenarioMaxScore).toBe(95);
    });
    it('es terminal cuando la decisión no tiene escenario siguiente', () => {
        const outcome = service.evaluate(decision({ score: 90, nextScenarioId: null }), [decision({ score: 90 })]);
        expect(outcome.isTerminal).toBe(true);
        expect(outcome.nextScenarioId).toBeNull();
    });
    it('no es terminal cuando hay escenario siguiente', () => {
        const outcome = service.evaluate(decision({ score: 90, nextScenarioId: 7 }), [decision({ score: 90, nextScenarioId: 7 })]);
        expect(outcome.isTerminal).toBe(false);
        expect(outcome.nextScenarioId).toBe(7);
    });
});
