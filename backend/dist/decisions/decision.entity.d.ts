import { ScenarioEntity } from '../scenarios/scenario.entity';
import { AttemptStepEntity } from '../attempts/attempt-step.entity';
export declare class DecisionEntity {
    id: number;
    scenarioId: number;
    scenario: ScenarioEntity;
    code: string;
    label: string;
    consequence: string;
    feedback: string;
    score: number;
    nextScenarioId: number | null;
    steps: AttemptStepEntity[];
}
