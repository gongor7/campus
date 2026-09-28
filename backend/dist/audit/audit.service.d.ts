import { Repository } from 'typeorm';
import { AuditLogEntity, AuditResult } from './audit.entity';
export interface AuditEntry {
    action: string;
    resourceType: string;
    resourceId: string | number;
    detail?: Record<string, unknown>;
    result?: AuditResult;
}
export declare class AuditService {
    private readonly logs;
    private readonly logger;
    constructor(logs: Repository<AuditLogEntity>);
    log(entry: AuditEntry): Promise<void>;
    findByResource(resourceType?: string, resourceId?: string, limit?: number): Promise<AuditLogEntity[]>;
}
