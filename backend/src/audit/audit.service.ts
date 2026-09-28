import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity, AuditResult } from './audit.entity';

export interface AuditEntry {
  action: string;
  resourceType: string;
  resourceId: string | number;
  detail?: Record<string, unknown>;
  result?: AuditResult;
}

/**
 * Registro de trazabilidad institucional: quien, que operacion, sobre que
 * recurso, cuando y con que resultado. Los registros son inmutables y el
 * logging nunca debe romper la operacion principal (SPEC-audit).
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly logs: Repository<AuditLogEntity>,
  ) {}

  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.logs.save(
        this.logs.create({
          actor: 'docente',
          action: entry.action,
          resourceType: entry.resourceType,
          resourceId: String(entry.resourceId),
          detail: entry.detail ?? null,
          result: entry.result ?? 'SUCCESS',
        }),
      );
    } catch (error) {
      this.logger.error(`No se pudo registrar auditoria de ${entry.action}: ${(error as Error).message}`);
    }
  }

  findByResource(resourceType?: string, resourceId?: string, limit = 200): Promise<AuditLogEntity[]> {
    const where: Record<string, string> = {};
    if (resourceType) where.resourceType = resourceType;
    if (resourceId) where.resourceId = resourceId;
    return this.logs.find({
      where,
      order: { createdAt: 'DESC', id: 'DESC' },
      take: Math.min(limit, 500),
    });
  }
}
