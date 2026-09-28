"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const attempt_entity_1 = require("./attempt.entity");
const cooldown_1 = require("./cooldown");
describe('Maquina de estados del intento', () => {
    it('permite el camino feliz PREPARING -> IN_PROGRESS -> GRADING -> GRADED', () => {
        const path = ['PREPARING', 'IN_PROGRESS', 'GRADING', 'GRADED'];
        for (let i = 0; i < path.length - 1; i++) {
            expect(attempt_entity_1.ATTEMPT_TRANSITIONS[path[i]]).toContain(path[i + 1]);
        }
    });
    it('permite fallar hacia GRADING_FAILED desde cualquier estado activo', () => {
        for (const status of ['PREPARING', 'IN_PROGRESS', 'GRADING']) {
            expect(attempt_entity_1.ATTEMPT_TRANSITIONS[status]).toContain('GRADING_FAILED');
        }
    });
    it('los estados terminales no tienen transiciones', () => {
        expect(attempt_entity_1.ATTEMPT_TRANSITIONS.GRADED).toEqual([]);
        expect(attempt_entity_1.ATTEMPT_TRANSITIONS.GRADING_FAILED).toEqual([]);
    });
    it('no permite saltar de PREPARING a GRADING', () => {
        expect(attempt_entity_1.ATTEMPT_TRANSITIONS.PREPARING).not.toContain('GRADING');
    });
});
describe('cooldownRemainingMs', () => {
    it('por defecto son 10 minutos', () => {
        expect(cooldown_1.DEFAULT_COOLDOWN_MINUTES).toBe(10);
    });
    it('dentro de la ventana devuelve el resto', () => {
        const submitted = new Date('2026-09-28T10:00:00Z');
        const now = new Date('2026-09-28T10:04:00Z');
        expect((0, cooldown_1.cooldownRemainingMs)(submitted, now)).toBe(6 * 60 * 1000);
    });
    it('fuera de la ventana devuelve cero', () => {
        const submitted = new Date('2026-09-28T10:00:00Z');
        const now = new Date('2026-09-28T10:11:00Z');
        expect((0, cooldown_1.cooldownRemainingMs)(submitted, now)).toBe(0);
    });
    it('respeta minutos personalizados (tests con 0)', () => {
        const submitted = new Date();
        expect((0, cooldown_1.cooldownRemainingMs)(submitted, new Date(), 0)).toBe(0);
    });
});
