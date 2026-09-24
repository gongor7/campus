import { Injectable } from '@nestjs/common';
import { DecisionEntity } from '../decisions/decision.entity';

export interface EvaluationOutcome {
  /** Puntaje que la decisión aporta al intento (0–100). */
  awardedScore: number;
  /** Máximo alcanzable del escenario donde se decidió. */
  scenarioMaxScore: number;
  /** true si esta decisión cierra la simulación. */
  isTerminal: boolean;
  nextScenarioId: number | null;
}

/**
 * Motor de evaluación determinístico del MVP.
 * Aislado deliberadamente del resto de la aplicación para poder
 * sustituirlo en fases futuras (p. ej. evaluación asistida por IA)
 * sin modificar controladores ni persistencia (Constitución #8).
 */
@Injectable()
export class EvaluationService {
  evaluate(decision: DecisionEntity, scenarioDecisions: DecisionEntity[]): EvaluationOutcome {
    const scenarioMaxScore = Math.max(...scenarioDecisions.map((d) => d.score));
    return {
      awardedScore: decision.score,
      scenarioMaxScore,
      isTerminal: decision.nextScenarioId === null,
      nextScenarioId: decision.nextScenarioId,
    };
  }
}
