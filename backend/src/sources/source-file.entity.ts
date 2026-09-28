import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SourceEntity } from './source.entity';

/**
 * Bytes del documento. Almacenar en la base de datos mantiene el MVP sin
 * dependencias externas y funciona igual en local y en serverless; si el
 * volumen crece, se migra a un almacen de objetos cambiando storagePath.
 */
@Entity('source_files')
export class SourceFileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  sourceId: number;

  @OneToOne(() => SourceEntity)
  @JoinColumn({ name: 'sourceId' })
  source: SourceEntity;

  @Column({ type: 'bytea' })
  data: Buffer;
}
