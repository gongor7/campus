"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const content_1 = require("./content");
describe('Contenido de la simulación piloto (T7)', () => {
    const codes = new Set(content_1.PILOT_SIMULATION.scenarios.map((s) => s.code));
    it('tiene al menos 5 escenarios con 3 decisiones cada uno', () => {
        expect(content_1.PILOT_SIMULATION.scenarios.length).toBeGreaterThanOrEqual(5);
        for (const s of content_1.PILOT_SIMULATION.scenarios) {
            expect(s.decisions.length).toBe(3);
        }
    });
    it('todas las ramas nextScenarioCode apuntan a escenarios existentes o a fin (null)', () => {
        for (const s of content_1.PILOT_SIMULATION.scenarios) {
            for (const d of s.decisions) {
                if (d.nextScenarioCode !== null) {
                    expect(codes.has(d.nextScenarioCode)).toBe(true);
                }
            }
        }
    });
    it('existe al menos una decisión terminal (fin de simulación)', () => {
        const terminal = content_1.PILOT_SIMULATION.scenarios.some((s) => s.decisions.some((d) => d.nextScenarioCode === null));
        expect(terminal).toBe(true);
    });
    it('los puntajes están en el rango 0–100', () => {
        for (const s of content_1.PILOT_SIMULATION.scenarios) {
            for (const d of s.decisions) {
                expect(d.score).toBeGreaterThanOrEqual(0);
                expect(d.score).toBeLessThanOrEqual(100);
            }
        }
    });
});
