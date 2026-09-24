import { defineStore } from 'pinia';
import { api, type Attempt, type PublicScenario, type DecisionOutcome, getSessionId } from '../api';

interface AttemptState {
  attempt: Attempt | null;
  scenario: PublicScenario | null;
  outcome: DecisionOutcome | null;
  progress: number; // escenarios recorridos
  loading: boolean;
  error: string | null;
}

export const useAttemptStore = defineStore('attempt', {
  state: (): AttemptState => ({
    attempt: null,
    scenario: null,
    outcome: null,
    progress: 0,
    loading: false,
    error: null,
  }),
  actions: {
    async start(simulationId: number) {
      this.$reset();
      this.loading = true;
      try {
        const { attempt, scenario } = await api.startAttempt(simulationId, getSessionId());
        this.attempt = attempt;
        this.scenario = scenario;
        this.progress = 1;
      } catch (e) {
        this.error = (e as Error).message;
      } finally {
        this.loading = false;
      }
    },
    async load(attemptId: string) {
      this.$reset();
      this.loading = true;
      try {
        const { attempt, scenario } = await api.attemptState(attemptId);
        this.attempt = attempt;
        this.scenario = scenario;
        this.progress = 1;
      } catch (e) {
        this.error = (e as Error).message;
      } finally {
        this.loading = false;
      }
    },
    async decide(decisionId: number) {
      if (!this.attempt) return;
      this.loading = true;
      try {
        const outcome = await api.decide(this.attempt.id, decisionId);
        this.outcome = outcome;
        this.progress += 1;
      } catch (e) {
        this.error = (e as Error).message;
      } finally {
        this.loading = false;
      }
    },
    /** Continuar tras ver la retroalimentación: pasa al siguiente escenario o finaliza. */
    continueToNext() {
      if (!this.outcome) return;
      if (this.outcome.completed) {
        this.scenario = null;
      } else {
        this.scenario = this.outcome.nextScenario;
        this.outcome = null;
      }
    },
  },
});
