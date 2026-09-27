import { DecisionEntity } from '../decisions/decision.entity';
export interface EvaluationOutcome {
    awardedScore: number;
    scenarioMaxScore: number;
    isTerminal: boolean;
    nextScenarioId: number | null;
}
export declare class EvaluationService {
    evaluate(decision: DecisionEntity, scenarioDecisions: DecisionEntity[]): EvaluationOutcome;
}
