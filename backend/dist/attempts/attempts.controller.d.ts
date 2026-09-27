import { AttemptsService } from './attempts.service';
import { CreateAttemptDto, DecideDto } from './dto';
export declare class AttemptsController {
    private readonly attemptsService;
    constructor(attemptsService: AttemptsService);
    create(dto: CreateAttemptDto): Promise<{
        attempt: import("./attempt.entity").AttemptEntity;
        scenario: import("./attempts.service").PublicScenario;
    }>;
    getState(id: string): Promise<{
        attempt: import("./attempt.entity").AttemptEntity;
        scenario: import("./attempts.service").PublicScenario | null;
    }>;
    decide(id: string, dto: DecideDto): Promise<{
        consequence: string;
        feedback: string;
        stepMaxScore: number;
        completed: boolean;
        nextScenario: import("./attempts.service").PublicScenario | null;
    }>;
    getResult(id: string): Promise<{
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
}
