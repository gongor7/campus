import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly audit;
    constructor(audit: AuditService);
    findAll(resourceType?: string, resourceId?: string): Promise<import("./audit.entity").AuditLogEntity[]>;
}
