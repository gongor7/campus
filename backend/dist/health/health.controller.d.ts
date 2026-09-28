import { HealthService } from './health.service';
export declare class HealthController {
    private readonly health;
    constructor(health: HealthService);
    getStatus(): {
        status: string;
        timestamp: string;
    };
}
