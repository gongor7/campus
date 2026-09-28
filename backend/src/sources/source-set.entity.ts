import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SourceEntity } from './source.entity';

@Entity('source_sets')
export class SourceSetEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => SourceEntity, (source) => source.sourceSet)
  sources: SourceEntity[];
}
