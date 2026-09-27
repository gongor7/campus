import { Repository } from 'typeorm';
import { AttemptEntity } from './attempt.entity';
import { AttemptStepEntity } from './attempt-step.entity';
import { ScenarioEntity } from '../scenarios/scenario.entity';
import { DecisionEntity } from '../decisions/decision.entity';
import { EvaluationService } from '../evaluation/evaluation.service';
export interface PublicScenario {
    id: number;
    code: string;
    title: string;
    context: string;
    information: ScenarioEntity['information'];
    question: string;
    decisions: {
        id: number;
        code: string;
        label: string;
    }[];
}
export declare class AttemptsService {
    private readonly attempts;
    private readonly steps;
    private readonly scenarios;
    private readonly decisions;
    private readonly evaluation;
    constructor(attempts: Repository<AttemptEntity>, steps: Repository<AttemptStepEntity>, scenarios: Repository<ScenarioEntity>, decisions: Repository<DecisionEntity>, evaluation: EvaluationService);
    create(simulationId: number, sessionId: string): Promise<{
        attempt: AttemptEntity;
        scenario: PublicScenario;
    }>;
    findById(id: string): Promise<AttemptEntity>;
    getState(id: string): Promise<{
        attempt: AttemptEntity;
        scenario: PublicScenario | null;
    }>;
    decide(attemptId: string, decisionId: number): Promise<{
        consequence: string;
        feedback: string;
        stepMaxScore: number;
        completed: boolean;
        nextScenario: PublicScenario | null;
    }>;
    getResult(attemptId: string): Promise<{
        attemptId: string;
        simulationId: number;
        score: number;
        maxScore: number;
        steps: {
            position: number;
            scenarioTitle: string;
            question: string;
            decisionLabel: string;
            feedback: string;
            score: number;
        }[];
    }>;
    private toPublicScenario;
}
