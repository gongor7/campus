import { Repository } from 'typeorm';
import { SimulationEntity } from './simulation.entity';
export declare class SimulationsService {
    private readonly simulations;
    constructor(simulations: Repository<SimulationEntity>);
    findAll(): Promise<SimulationEntity[]>;
    findById(id: number): Promise<SimulationEntity>;
}
