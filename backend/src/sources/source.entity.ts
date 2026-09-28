import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SourceSetEntity } from './source-set.entity';

@Entity('sources')
@Index('ix_source_set', ['sourceSetId'])
export class SourceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sourceSetId: number;

  @ManyToOne(() => SourceSetEntity, (set) => set.sources)
  @JoinColumn({ name: 'sourceSetId' })
  sourceSet: SourceSetEntity;

  @Column({ length: 255 })
  filename: string;

  @Column({ length: 100 })
  mimeType: string;

  @Column({ type: 'int' })
  sizeBytes: number;

  /**
   * Referencia al almacen: en el MVP es 'db:<sourceId>' (bytes en la tabla
   * source_files). Un proveedor externo (p. ej. Supabase Storage) podria usar
   * su propia ruta sin cambiar el dominio.
   */
  @Column({ length: 500, default: '' })
  storagePath: string;

  @Column({ default: 'docente' })
  uploadedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
