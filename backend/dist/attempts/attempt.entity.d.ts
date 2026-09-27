import { SimulationEntity } from '../simulations/simulation.entity';
import { ScenarioEntity } from '../scenarios/scenario.entity';
import { AttemptStepEntity } from './attempt-step.entity';
export type AttemptStatus = 'in_progress' | 'completed';
export declare class AttemptEntity {
    id: string;
    sessionId: string;
    simulationId: number;
    simulation: SimulationEntity;
    currentScenarioId: number | null;
    currentScenario: ScenarioEntity;
    status: AttemptStatus;
    score: number;
    maxScore: number;
    createdAt: Date;
    completedAt: Date | null;
    steps: AttemptStepEntity[];
}
