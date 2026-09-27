import { ScenarioEntity } from '../scenarios/scenario.entity';
export declare class SimulationEntity {
    id: number;
    slug: string;
    title: string;
    objective: string;
    description: string;
    createdAt: Date;
    scenarios: ScenarioEntity[];
}
