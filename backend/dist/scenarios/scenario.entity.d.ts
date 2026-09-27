import { SimulationEntity } from '../simulations/simulation.entity';
import { DecisionEntity } from '../decisions/decision.entity';
export interface Indicator {
    name: string;
    value: string;
    trend?: string;
    note?: string;
}
export interface ScenarioInformation {
    indicators: Indicator[];
    documents?: {
        title: string;
        summary: string;
    }[];
    notes?: string[];
}
export declare class ScenarioEntity {
    id: number;
    simulationId: number;
    simulation: SimulationEntity;
    code: string;
    title: string;
    context: string;
    information: ScenarioInformation;
    question: string;
    decisions: DecisionEntity[];
}
