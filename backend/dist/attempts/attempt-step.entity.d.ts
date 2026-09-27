import { AttemptEntity } from './attempt.entity';
import { ScenarioEntity } from '../scenarios/scenario.entity';
import { DecisionEntity } from '../decisions/decision.entity';
export declare class AttemptStepEntity {
    id: number;
    attemptId: string;
    attempt: AttemptEntity;
    scenarioId: number;
    scenario: ScenarioEntity;
    decisionId: number;
    decision: DecisionEntity;
    position: number;
    createdAt: Date;
}
