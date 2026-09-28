export type AuditResult = 'SUCCESS' | 'ERROR';
export declare class AuditLogEntity {
    id: number;
    actor: string;
    action: string;
    resourceType: string;
    resourceId: string;
    detail: Record<string, unknown> | null;
    result: AuditResult;
    createdAt: Date;
}
