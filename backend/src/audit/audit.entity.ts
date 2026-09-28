import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type AuditResult = 'SUCCESS' | 'ERROR';

@Entity('audit_logs')
@Index('ix_audit_resource', ['resourceType', 'resourceId'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /** MVP: usuario fijo 'docente' (auth diferido); luego userId real. */
  @Column({ default: 'docente' })
  actor: string;

  @Column({ length: 50 })
  action: string;

  @Column({ length: 50 })
  resourceType: string;

  @Column({ length: 64 })
  resourceId: string;

  @Column({ type: 'jsonb', nullable: true })
  detail: Record<string, unknown> | null;

  @Column({ length: 20 })
  result: AuditResult;

  @CreateDateColumn()
  createdAt: Date;
}
