import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAttemptStore } from '../src/stores/attempt';
import * as apiModule from '../src/api';

vi.mock('../src/api', () => ({
  api: {
    startAttempt: vi.fn(),
    attemptState: vi.fn(),
    decide: vi.fn(),
  },
  getSessionId: () => 'test-session',
}));

const api = vi.mocked(apiModule.api);

describe('AttemptStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('start() carga intento y primer escenario', async () => {
    api.startAttempt.mockResolvedValue({
      attempt: { id: 'a1', simulationId: 1, status: 'in_progress' },
      scenario: { id: 1, code: 'E1', title: 'T', context: 'C', information: { indicators: [] }, question: 'Q', decisions: [] },
    });
    const store = useAttemptStore();
    await store.start(1);
    expect(api.startAttempt).toHaveBeenCalledWith(1, 'test-session');
    expect(store.attempt?.id).toBe('a1');
    expect(store.scenario?.code).toBe('E1');
  });

  it('decide() guarda el outcome y continueToNext() avanza de escenario', async () => {
    const store = useAttemptStore();
    store.attempt = { id: 'a1', simulationId: 1, status: 'in_progress' };
    api.decide.mockResolvedValue({
      consequence: 'cons', feedback: 'fb', stepMaxScore: 100, completed: false,
      nextScenario: { id: 2, code: 'E2A', title: 'T2', context: 'C', information: { indicators: [] }, question: 'Q', decisions: [] },
    });
    await store.decide(5);
    expect(api.decide).toHaveBeenCalledWith('a1', 5);
    expect(store.outcome?.feedback).toBe('fb');

    store.continueToNext();
    expect(store.scenario?.code).toBe('E2A');
    expect(store.outcome).toBeNull();
  });

  it('continueToNext() con decisión terminal limpia el escenario (fin)', async () => {
    const store = useAttemptStore();
    store.attempt = { id: 'a1', simulationId: 1, status: 'in_progress' };
    api.decide.mockResolvedValue({
      consequence: 'cons', feedback: 'fb', stepMaxScore: 100, completed: true, nextScenario: null,
    });
    await store.decide(9);
    store.continueToNext();
    expect(store.scenario).toBeNull();
    expect(store.outcome?.completed).toBe(true);
  });

  it('decide() con error del backend guarda el mensaje', async () => {
    const store = useAttemptStore();
    store.attempt = { id: 'a1', simulationId: 1, status: 'in_progress' };
    api.decide.mockRejectedValue(new Error('La decisión no pertenece al escenario actual'));
    await store.decide(999);
    expect(store.error).toContain('no pertenece');
    expect(store.outcome).toBeNull();
  });
});
