import { ATTEMPT_TRANSITIONS, AttemptStatus } from './attempt.entity';
import { DEFAULT_COOLDOWN_MINUTES, cooldownRemainingMs } from './cooldown';

// T11 — maquina de estados del intento (RF-19, RF-21, RF-25).
describe('Maquina de estados del intento', () => {
  it('permite el camino feliz PREPARING -> IN_PROGRESS -> GRADING -> GRADED', () => {
    const path: AttemptStatus[] = ['PREPARING', 'IN_PROGRESS', 'GRADING', 'GRADED'];
    for (let i = 0; i < path.length - 1; i++) {
      expect(ATTEMPT_TRANSITIONS[path[i]]).toContain(path[i + 1]);
    }
  });

  it('permite fallar hacia GRADING_FAILED desde cualquier estado activo', () => {
    for (const status of ['PREPARING', 'IN_PROGRESS', 'GRADING'] as AttemptStatus[]) {
      expect(ATTEMPT_TRANSITIONS[status]).toContain('GRADING_FAILED');
    }
  });

  it('los estados terminales no tienen transiciones', () => {
    expect(ATTEMPT_TRANSITIONS.GRADED).toEqual([]);
    expect(ATTEMPT_TRANSITIONS.GRADING_FAILED).toEqual([]);
  });

  it('no permite saltar de PREPARING a GRADING', () => {
    expect(ATTEMPT_TRANSITIONS.PREPARING).not.toContain('GRADING');
  });
});

// T13 — enfriamiento (RF-24).
describe('cooldownRemainingMs', () => {
  it('por defecto son 10 minutos', () => {
    expect(DEFAULT_COOLDOWN_MINUTES).toBe(10);
  });

  it('dentro de la ventana devuelve el resto', () => {
    const submitted = new Date('2026-09-28T10:00:00Z');
    const now = new Date('2026-09-28T10:04:00Z');
    expect(cooldownRemainingMs(submitted, now)).toBe(6 * 60 * 1000);
  });

  it('fuera de la ventana devuelve cero', () => {
    const submitted = new Date('2026-09-28T10:00:00Z');
    const now = new Date('2026-09-28T10:11:00Z');
    expect(cooldownRemainingMs(submitted, now)).toBe(0);
  });

  it('respeta minutos personalizados (tests con 0)', () => {
    const submitted = new Date();
    expect(cooldownRemainingMs(submitted, new Date(), 0)).toBe(0);
  });
});
