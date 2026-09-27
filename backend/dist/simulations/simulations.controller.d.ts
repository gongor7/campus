import { SimulationsService } from './simulations.service';
export declare class SimulationsController {
    private readonly simulationsService;
    constructor(simulationsService: SimulationsService);
    findAll(): Promise<import("./simulation.entity").SimulationEntity[]>;
    findOne(id: number): Promise<import("./simulation.entity").SimulationEntity>;
}
