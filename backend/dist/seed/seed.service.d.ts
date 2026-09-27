import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SimulationEntity } from '../simulations/simulation.entity';
import { ScenarioEntity } from '../scenarios/scenario.entity';
import { DecisionEntity } from '../decisions/decision.entity';
export declare class SeedService implements OnModuleInit {
    private readonly simulations;
    private readonly scenarios;
    private readonly decisions;
    private readonly logger;
    constructor(simulations: Repository<SimulationEntity>, scenarios: Repository<ScenarioEntity>, decisions: Repository<DecisionEntity>);
    onModuleInit(): Promise<void>;
    seedPilot(): Promise<void>;
}
