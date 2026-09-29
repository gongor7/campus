import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('app_settings')
export class AppSettingEntity {
  @PrimaryColumn({ length: 50 })
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
