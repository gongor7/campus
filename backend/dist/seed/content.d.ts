import { ScenarioInformation } from '../scenarios/scenario.entity';
export interface SeedDecision {
    code: string;
    label: string;
    consequence: string;
    feedback: string;
    score: number;
    nextScenarioCode: string | null;
}
export interface SeedScenario {
    code: string;
    title: string;
    context: string;
    information: ScenarioInformation;
    question: string;
    decisions: SeedDecision[];
}
export interface SeedSimulation {
    slug: string;
    title: string;
    objective: string;
    description: string;
    scenarios: SeedScenario[];
}
export declare const PILOT_SIMULATION: SeedSimulation;
